use axum::{
    extract::State,
    http::{Method, StatusCode},
    routing::{get, post},
    Json, Router,
};
use lol_html::{element, rewrite_str, RewriteStrSettings};
use moka::future::Cache;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Duration;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Deserialize)]
struct FetchRequest {
    url: String,
}

#[derive(Serialize)]
struct FetchResponse {
    html: String,
    status: u16,
    url: String,
    cached: bool,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

struct AppState {
    cache: Cache<String, String>,
    client: reqwest::Client,
}

fn sanitize_html(html: &str) -> String {
    let element_content_handlers = vec![
        // Remove scripts
        element!("script", |el| {
            el.remove();
            Ok(())
        }),
        // Remove iframes and objects
        element!("iframe, object, embed", |el| {
            el.remove();
            Ok(())
        }),
    ];

    let settings = RewriteStrSettings {
        element_content_handlers,
        ..RewriteStrSettings::default()
    };

    match rewrite_str(html, settings) {
        Ok(s) => s,
        Err(_) => html.to_string(), // Fallback to original if rewriting fails
    }
}

async fn fetch_handler(
    State(state): State<Arc<AppState>>,
    Json(req): Json<FetchRequest>,
) -> Result<Json<FetchResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Validate URL
    let parsed = reqwest::Url::parse(&req.url).map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: format!("Invalid URL: {}", e),
            }),
        )
    })?;

    // Only HTTP(S) allow list
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Only HTTP/HTTPS protocols are allowed".into(),
            }),
        ));
    }

    // Check Cache
    if let Some(html) = state.cache.get(&req.url).await {
        return Ok(Json(FetchResponse {
            html,
            status: 200,
            url: req.url,
            cached: true,
        }));
    }

    // Fetch
    let response = state.client.get(&req.url).send().await.map_err(|e| {
        (
            StatusCode::BAD_GATEWAY,
            Json(ErrorResponse {
                error: format!("Fetch failed: {}", e),
            }),
        )
    })?;

    let status = response.status().as_u16();
    let url = response.url().to_string();

    let raw_html = response.text().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Read body failed: {}", e),
            }),
        )
    })?;

    // Sanitize
    let html = sanitize_html(&raw_html);

    // Cache (only successful 200 responses)
    if status == 200 {
        state.cache.insert(req.url.clone(), html.clone()).await;
    }

    Ok(Json(FetchResponse {
        html,
        status,
        url,
        cached: false,
    }))
}

async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    // Initialize Cache
    let cache = Cache::builder()
        .max_capacity(1000)
        .time_to_live(Duration::from_secs(300)) // 5 minutes
        .build();

    // Initialize Client
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("Mozilla/5.0 (compatible; ScraperProxy/1.0)")
        .build()
        .unwrap();

    let state = Arc::new(AppState { cache, client });

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);

    let app = Router::new()
        .route("/fetch", post(fetch_handler))
        .route("/health", get(health))
        .layer(cors)
        .with_state(state);

    let addr = "0.0.0.0:3001";
    println!("Proxy running on http://{}", addr);

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(l) => l,
        Err(e) => {
            eprintln!("❌ Failed to bind to {}: {}", addr, e);
            if e.kind() == std::io::ErrorKind::AddrInUse {
                eprintln!("   Port 3001 is already in use.");
                eprintln!("   Try finding the process with: lsof -i :3001");
            }
            std::process::exit(1);
        }
    };

    if let Err(e) = axum::serve(listener, app).await {
        eprintln!("Server error: {}", e);
        std::process::exit(1);
    }
}
