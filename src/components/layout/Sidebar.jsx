import { NavLink }  from 'react-router-dom';
import { motion }   from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn }       from '../../utils/formatters';

export default function Sidebar({ links = [], title, footer }) {
  return (
    <aside className="w-full">
      {title && (
        <p className="eyebrow text-stone/30 text-[10px] px-3 mb-3">{title}</p>
      )}

      <nav className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
        {links.map((section, si) => (
          <div key={si}>
            {section.sectionLabel && (
              <p className="eyebrow text-stone/25 text-[9px] px-4 pt-4 pb-1">
                {section.sectionLabel}
              </p>
            )}
            {(section.items || [section]).map((link) => {
              if (!link.href) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.exact}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200',
                    'border-b border-white/[0.04] last:border-b-0 group',
                    isActive
                      ? 'bg-gold/8 text-gold border-l-2 border-l-gold pl-[14px]'
                      : 'text-stone hover:text-cream hover:bg-white/[0.03]'
                  )}
                >
                  {Icon && <Icon size={14} className="shrink-0" />}
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-mono bg-vermillion/10 border border-vermillion/20 text-vermillion px-1.5 py-0.5">
                      {link.badge}
                    </span>
                  )}
                  <ChevronRight
                    size={11}
                    className="opacity-0 group-hover:opacity-30 transition-opacity shrink-0"
                  />
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {footer && (
        <div className="mt-3">{footer}</div>
      )}
    </aside>
  );
}