import React from 'react';

const icons = {
  login: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  signup: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path d="M12 11c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  default: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
  )
};

const PageIcon = ({ name='default', className='', style={} }) => {
  const Icon = icons[name] || icons.default;
  return (
    <span className={`page-icon ${className}`} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:8, background:'rgba(16,24,40,0.04)', color:'#0f172a', ...style }} aria-hidden>
      <Icon />
    </span>
  );
};

export default PageIcon;
