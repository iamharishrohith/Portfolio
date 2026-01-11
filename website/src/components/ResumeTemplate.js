export default function ResumeTemplate({ profile, experiences, education, skills, projects }) {
    if (!profile) return null;

    return (
        <div id="resume-template" className="bg-white text-slate-900 p-8 w-[210mm] min-h-[297mm] mx-auto shadow-2xl hidden print:block">
            {/* Header */}
            <header className="border-b-2 border-slate-900 pb-8 mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{profile.full_name}</h1>
                <p className="text-xl font-bold text-slate-600 uppercase tracking-widest mb-6">{profile.headline || profile.job_title}</p>

                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                    {profile.email && (
                        <div className="flex items-center gap-2">
                            <span>{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-2">
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.linkedin_url && (
                        <div className="flex items-center gap-2">
                            <span>LinkedIn</span>
                        </div>
                    )}
                    {profile.github_url && (
                        <div className="flex items-center gap-2">
                            <span>GitHub</span>
                        </div>
                    )}
                    {profile.portfolio_url && (
                        <div className="flex items-center gap-2">
                            <span>Portfolio</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="col-span-2 space-y-8">
                    {/* Summary */}
                    {profile.bio && (
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-400">
                                Professional Summary
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {profile.bio}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {experiences?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-400">
                                Experience
                            </h3>
                            <div className="space-y-6">
                                {experiences.map((exp) => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-slate-900">{exp.title}</h4>
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(exp.start_date).getFullYear()} -
                                                {exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()}
                                            </span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-600 mb-2">{exp.company}</div>
                                        <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-400">
                                Key Projects
                            </h3>
                            <div className="space-y-4">
                                {projects.slice(0, 4).map((project) => (
                                    <div key={project.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-slate-900">{project.title}</h4>
                                            {project.demo_url && (
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">{project.demo_url}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-700 mb-1">{project.description}</p>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                            {project.tech_stack?.join(' • ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Skills */}
                    {skills?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-400">
                                Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <span key={skill.id} className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-400">
                                Education
                            </h3>
                            <div className="space-y-4">
                                {education.map((edu) => (
                                    <div key={edu.id}>
                                        <h4 className="font-bold text-sm text-slate-900">{edu.institution}</h4>
                                        <div className="text-xs font-medium text-slate-600">{edu.degree}</div>
                                        <div className="text-xs text-slate-500">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
