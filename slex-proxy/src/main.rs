use axum::{
    routing::{get, post},
    Json, Router,
    http::{StatusCode, Method},
};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tower_http::cors::{CorsLayer, Any};
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
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn fetch_handler(
    Json(req): Json<FetchRequest>,
) -> Result<Json<FetchResponse>, (StatusCode, Json<ErrorResponse>)> {
    // Validate URL
    let parsed = reqwest::Url::parse(&req.url)
        .map_err(|e| (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: format!("Invalid URL: {}", e) })
        ))?;
    
    // Only HTTP(S) allow list
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: "Only HTTP/HTTPS protocols are allowed".into() })
        ));
    }
    
    // Setup client with timeout
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("Mozilla/5.0 (compatible; ScraperProxy/1.0)")
        .build()
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: format!("Failed to build client: {}", e) })
        ))?;
    
    // Fetch
    let response = client
        .get(&req.url)
        .send()
        .await
        .map_err(|e| (
            StatusCode::BAD_GATEWAY,
            Json(ErrorResponse { error: format!("Fetch failed: {}", e) })
        ))?;
    
    let status = response.status().as_u16();
    let url = response.url().to_string();

    let html = response
        .text()
        .await
        .map_err(|e| (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: format!("Read body failed: {}", e) })
        ))?;
    
    Ok(Json(FetchResponse { html, status, url }))
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

    // CORS configuration - Allow all origins for dev, restrict in prod
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any);
    
    let app = Router::new()
        .route("/fetch", post(fetch_handler))
        .route("/health", get(health))
        .layer(cors);
    
    let addr = "0.0.0.0:3001";
    println!("Proxy running on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap();
    
    axum::serve(listener, app).await.unwrap();
}
