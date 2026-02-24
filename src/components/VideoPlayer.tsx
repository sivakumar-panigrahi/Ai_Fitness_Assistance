// src/components/VideoPlayer.tsx
export function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
    return (
        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-soft bg-muted">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}
