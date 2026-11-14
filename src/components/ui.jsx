export const Tag=({children,c='text-mute'})=><span className={`font-mono text-[11px] tracking-wide ${c}`}>{children}</span>
export const Panel=({className='',children})=><div className={`border border-line bg-panel/80 backdrop-blur-sm transition hover:border-lime/30 ${className}`}>{children}</div>
export const Dot=({c='#22E4F7',pulse})=><span className="relative inline-flex h-2 w-2">{pulse&&<span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{background:c}}/>}<span className="relative h-2 w-2 rounded-full" style={{background:c}}/></span>
export const Empty=({title,hint,children})=><div className="border border-dashed border-line p-10 text-center"><p className="font-display text-lg">{title}</p><p className="mt-1 text-sm text-mute">{hint}</p><div className="mt-4">{children}</div></div>
export const ttip={contentStyle:{background:'#0D1628',border:'1px solid #1B2A47',borderRadius:0,fontSize:12},labelStyle:{color:'#7F8FB0'}}
