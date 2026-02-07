export const SAMPLE_PAGES: Record<string, string> = {
    'https://wiki.local/typography-history': `
        <article class="font-serif text-gray-900 leading-relaxed max-w-prose mx-auto">
            <header class="mb-10 text-center border-b-2 border-black pb-8">
                <div class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Design History Series</div>
                <h1 class="text-5xl font-bold mb-4 tracking-tight">The Evolution of Type</h1>
                <div class="flex justify-center items-center text-sm italic text-gray-600 space-x-4">
                    <span>By J. Gutenberg</span>
                    <span>&bull;</span>
                    <time>Est. 1440</time>
                </div>
            </header>

            <div class="mb-8">
                <p class="text-xl mb-6 font-light">Type is speech made visible. From the scribes of ancient times to the digital screens of today, the history of typography is a reflection of human innovation.</p>
            </div>

            <div class="my-10 p-4 border border-gray-300 bg-gray-50">
                <img src="https://picsum.photos/800/600" alt="Gutenberg Press Sketch" class="w-full h-auto mb-2 mix-blend-multiply filter contrast-125">
                <div class="text-center text-xs text-gray-500 font-mono mt-2">Fig 1. The Movable Type Press</div>
            </div>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4 border-l-4 border-black pl-4">The Movable Type Revolution</h2>
                <p class="mb-4">Before the 15th century, books were handwritten by scribes. This process was incredibly slow and expensive. <strong class="font-bold">Johannes Gutenberg</strong> changed the world by introducing movable type to Europe.</p>
                <p class="mb-4">This innovation allowed for:</p>
                <ul class="list-disc list-inside mb-6 pl-4 space-y-2 marker:text-gray-400">
                    <li>Mass production of books</li>
                    <li>Standardization of language</li>
                    <li>Rapid spread of scientific knowledge</li>
                </ul>
            </section>

            <blockquote class="text-2xl italic font-light text-gray-600 border-l-2 border-gray-300 pl-6 py-2 my-10">
                "Typography is the detail and the solidity of text." 
                <footer class="text-sm not-italic text-gray-400 mt-2">&mdash; Robert Bringhurst</footer>
            </blockquote>

            <section class="mb-10">
                <h2 class="text-2xl font-bold mb-4 border-l-4 border-black pl-4">The Digital Transition</h2>
                <p class="mb-4">With the advent of computers, typography moved from lead to pixels. This transition brought new challenges:</p>
                <div class="grid grid-cols-2 gap-6 my-6">
                    <div class="bg-gray-100 p-4">
                        <h3 class="font-bold mb-2 text-sm uppercase">Serif</h3>
                        <p class="text-xs">Traditional, easier to read in print. Characterized by decorative lines at the end of strokes.</p>
                    </div>
                    <div class="bg-gray-100 p-4">
                        <h3 class="font-bold mb-2 text-sm uppercase">Sans-Serif</h3>
                        <p class="text-xs">Modern, clean, often preferred for digital screens due to low resolution legibility.</p>
                    </div>
                </div>
                <p>Today, variable fonts and responsive web design allow type to be as fluid as the content itself.</p>
            </section>
            
            <footer class="mt-16 pt-8 border-t border-gray-200 text-xs text-gray-500 font-mono text-center">
                <p>End of Document &bull; Indexed by DOM_OS</p>
            </footer>
        </article>
    `,
    'https://blog.local/minimalism': `
        <article class="font-serif text-gray-800 leading-loose max-w-prose mx-auto">
            <img src="https://picsum.photos/800/400" class="w-full h-64 object-cover mb-8 grayscale opacity-80">
            
            <h1 class="text-4xl font-bold mb-6 text-center">Less, But Better</h1>
            
            <p class="mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">Minimalism is not about subtraction for the sake of subtraction. It is about focusing on what is essential. In a world of noise, clarity is power.</p>

            <h2 class="text-lg font-bold uppercase tracking-widest mt-10 mb-4 text-center">Core Principles</h2>
            
            <ol class="list-decimal pl-6 space-y-6 mb-10 marker:font-bold marker:text-lg">
                <li class="pl-2">
                    <strong class="text-black block mb-1">Purposeful Content</strong>
                    Every element on the page must serve a function. Decoration without purpose is clutter.
                </li>
                <li class="pl-2">
                    <strong class="text-black block mb-1">Negative Space</strong>
                    White space is not empty space; it is an active design element that gives content room to breathe.
                </li>
                <li class="pl-2">
                    <strong class="text-black block mb-1">Typography as UI</strong>
                    When you remove boxes and lines, type becomes the primary structure of the interface.
                </li>
            </ol>

            <div class="bg-gray-100 p-6 italic text-center text-gray-600 my-8">
                Read the full manifesto in our upcoming book.
            </div>
        </article>
    `
};
