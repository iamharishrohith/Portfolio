import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'Project';
        const tags = searchParams.get('tags') ? searchParams.get('tags').split(',').slice(0, 3) : ['Secret'];
        const difficulty = searchParams.get('rank') || 'A';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a',
                        backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
                        position: 'relative',
                    }}
                >
                    {/* Cybernetic Grid Background */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.15) 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* Decorative Corners */}
                    <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, borderTop: '2px solid #a855f7', borderLeft: '2px solid #a855f7' }} />
                    <div style={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, borderTop: '2px solid #a855f7', borderRight: '2px solid #a855f7' }} />
                    <div style={{ position: 'absolute', bottom: 20, left: 20, width: 20, height: 20, borderBottom: '2px solid #a855f7', borderLeft: '2px solid #a855f7' }} />
                    <div style={{ position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, borderBottom: '2px solid #a855f7', borderRight: '2px solid #a855f7' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        {/* Rank Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                borderRadius: 8,
                                padding: '4px 12px',
                                marginBottom: 20,
                            }}
                        >
                            <span style={{ color: '#d8b4fe', fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>RANK: {difficulty}</span>
                        </div>

                        {/* Title */}
                        <div
                            style={{
                                color: '#fff',
                                fontSize: 60,
                                fontWeight: 900,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1,
                                textAlign: 'center',
                                textShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
                                maxWidth: '80%',
                            }}
                        >
                            {title.toUpperCase()}
                        </div>

                        {/* Subtitle/Decoration */}
                        <div style={{ fontSize: 14, color: '#64748b', letterSpacing: 4, marginTop: 10 }}>SYSTEM DUNGEON DETECTED</div>

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
                            {tags.map((tag) => (
                                <div
                                    key={tag}
                                    style={{
                                        backgroundColor: '#1e293b',
                                        color: '#94a3b8',
                                        padding: '6px 16px',
                                        borderRadius: 999,
                                        fontSize: 20,
                                        fontWeight: 600,
                                    }}
                                >
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e) {
        return new Response(`Failed to generate image`, {
            status: 500,
        });
    }
}
