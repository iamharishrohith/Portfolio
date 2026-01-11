'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import ResumeTemplate from './ResumeTemplate'

export default function ResumeDownloadButton({ data, className }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        try {
            setLoading(true)

            // Dynamic import to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default

            // Create a temporary container
            const container = document.createElement('div')
            document.body.appendChild(container)

            // Render the template to the container
            const root = createRoot(container)
            root.render(
                <ResumeTemplate
                    profile={data.profile}
                    experiences={data.experiences}
                    education={data.education}
                    skills={data.skills}
                    projects={data.projects}
                />
            )

            // Wait a moment for React to render
            await new Promise(resolve => setTimeout(resolve, 500))

            const element = container.querySelector('#resume-template')
            element.classList.remove('hidden') // Make visible for capture

            const opt = {
                margin: 0,
                filename: `${data.profile?.full_name?.replace(/\s+/g, '_')}_Resume.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            await html2pdf().set(opt).from(element).save()

            // Cleanup
            root.unmount()
            document.body.removeChild(container)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className={className || "flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20"}
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {loading ? 'Generating...' : 'Download Resume'}
        </button>
    )
}
