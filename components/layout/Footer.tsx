import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-muted/40 border-t border-border py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                {t('meta.title')}
              </span>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li><Link to="/funds" className="hover:text-primary transition-colors">{t('navigation.funds')}</Link></li>
              <li><Link to="/simulator" className="hover:text-primary transition-colors">{t('navigation.simulator')}</Link></li>
              <li><Link to="/portfolio-builder" className="hover:text-primary transition-colors">{t('navigation.portfolioBuilder')}</Link></li>
              <li><Link to="/tools" className="hover:text-primary transition-colors">{t('navigation.tools')}</Link></li>
              <li><Link to="/insights" className="hover:text-primary transition-colors">{t('navigation.insights')}</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
               <ShieldAlert className="h-5 w-5 text-amber-500" />
               {t('footer.legal')}
             </h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               {t('footer.legalDesc')}
             </p>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t('meta.title')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};