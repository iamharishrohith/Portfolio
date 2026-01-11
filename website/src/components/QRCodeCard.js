'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2 } from 'lucide-react'

export default function QRCodeCard({ url, name = "Harish Rohith", title = "System Architect" }) {
    const handleDownload = () => {
        const svg = document.getElementById('portfolio-qr')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = 256
            canvas.height = 256
            ctx.fillStyle = '#0f172a'
            ctx.fillRect(0, 0, 256, 256)
            ctx.drawImage(img, 0, 0)

            const pngFile = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.download = `${name.replace(/\s/g, '_')}_QR.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${name} - ${title}`,
                    text: `Check out ${name}'s portfolio`,
                    url: url,
                })
            } catch (err) {
                console.log('Share cancelled')
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url)
            alert('Link copied to clipboard!')
        }
    }

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
            {/* Header */}
            <div className="text-center space-y-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Digital Card</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white italic">SCAN TO CONNECT</h3>
            </div>

            {/* QR Code */}
            <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-white p-4 rounded-2xl border border-slate-100 shadow-lg">
                    <QRCodeSVG
                        id="portfolio-qr"
                        value={url}
                        size={160}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="text-center">
                <p className="text-slate-900 dark:text-white font-bold">{name}</p>
                <p className="text-purple-500 dark:text-purple-400 text-sm font-medium">{title}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                    <Download size={16} />
                    Save QR
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20"
                >
                    <Share2 size={16} />
                    Share
                </button>
            </div>
        </div>
    )
}
