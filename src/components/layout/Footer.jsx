import { Link }   from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, ArrowUpRight } from 'lucide-react';

const LINKS = {
  Shop:    [{ label: 'New Arrivals', href: '/products?isNewArrival=true' }, { label: 'Best Sellers', href: '/products?sort=popular' }, { label: 'Sale', href: '/products?sort=price_asc' }, { label: 'All Products', href: '/products' }],
  Account: [{ label: 'My Orders', href: '/orders' }, { label: 'Profile', href: '/profile' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'Wallet', href: '/wallet' }],
  Company: [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Blog', href: '/blog' }, { label: 'Press', href: '/press' }],
  Support: [{ label: 'Help Center', href: '/help' }, { label: 'Returns', href: '/returns' }, { label: 'Shipping', href: '/shipping' }, { label: 'Contact Us', href: '/contact' }],
};

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/[0.05] mt-32">
      <div className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-2xl text-cream">
                LUXE<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="text-stone text-sm leading-relaxed mb-6 max-w-xs">
              Curated luxury products for the discerning shopper. Quality over quantity, always.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Twitter,   href: '#' },
                { icon: Youtube,   href: '#' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  className="w-9 h-9 border border-white/[0.07] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="eyebrow text-stone/50 mb-5">{group}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-stone hover:text-cream transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border border-white/[0.06] p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="eyebrow text-gold/50 mb-2">Stay in the loop</p>
            <h3 className="font-display text-xl text-cream">Subscribe to our newsletter</h3>
          </div>
          <div className="flex w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 sm:w-64 bg-transparent border border-white/[0.07] border-r-0 px-4 py-3 text-sm text-cream placeholder:text-stone/30 outline-none focus:border-gold/30 transition-colors"
            />
            <button className="btn-primary !rounded-none whitespace-nowrap px-6 py-3">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-xs text-stone/40 font-mono">
            © {new Date().getFullYear()} LUXE Commerce. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-xs text-stone/40 hover:text-stone/70 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}