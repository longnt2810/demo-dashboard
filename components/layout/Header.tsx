import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Menu, Moon, Sun, Scale, PieChart, Briefcase, Calculator, Target, Flame, TrendingDown, Landmark } from 'lucide-react';
import { ThemeContext } from '../../App';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';
import { cn } from '../../lib/utils';

export const Header: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { label: t('navigation.home'), path: '/' },
    { 
      label: t('navigation.fund_data'), 
      path: '/funds',
      children: [
        { label: t('navigation.compare'), path: '/compare', icon: Scale, desc: "So sánh hiệu suất tăng trưởng giữa các quỹ." },
        { label: t('navigation.funds'), path: '/funds', icon: PieChart, desc: "Danh sách chi tiết các quỹ ETF và Quỹ mở." },
      ]
    },
    { 
      label: t('navigation.simulator'), 
      path: '/simulator',
      children: [
        { label: t('navigation.simulator'), path: '/simulator', icon: TrendingUp, desc: "Kiểm thử chiến lược đầu tư với dữ liệu quá khứ." },
        { label: t('navigation.portfolioBuilder'), path: '/portfolio-builder', icon: Briefcase, desc: "Xây dựng và tối ưu hóa danh mục đầu tư." },
      ]
    },
    { 
      label: t('navigation.tools'), 
      path: '/tools',
      groups: [
        {
          title: t('navigation.groups.investment'),
          items: [
             { label: t('navigation.toolItems.compound'), path: '/tools/compound-interest', icon: Calculator, desc: "Tính lãi suất kép tích lũy theo thời gian." },
             { label: t('navigation.toolItems.goal'), path: '/tools/financial-goal-planner', icon: Target, desc: "Lập kế hoạch tiết kiệm để đạt mục tiêu." },
             { label: t('navigation.toolItems.fire'), path: '/tools/fire-calculator', icon: Flame, desc: "Tính toán con số & lộ trình nghỉ hưu sớm." },
          ]
        },
        {
          title: t('navigation.groups.utilities'),
          items: [
             { label: t('navigation.toolItems.inflation'), path: '/tools/inflation-calculator', icon: TrendingDown, desc: "Tính giá trị thực của tiền theo lạm phát." },
             { label: t('navigation.toolItems.loan'), path: '/tools/loan-repayment', icon: Landmark, desc: "Tính lịch trả nợ vay mua nhà/xe chi tiết." }
          ]
        }
      ]
    },
    { label: t('navigation.insights'), path: '/insights' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  // Helper component for list items in nav menu
  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon?: React.ElementType }
  >(({ className, title, children, icon: Icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            to={props.href || "#"}
            className={cn(
              "block select-none rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 group",
              className
            )}
          >
            <div className="flex items-start gap-4">
              {Icon && (
                <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200/80 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold leading-none text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {title}
                </div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  {children}
                </p>
              </div>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  })
  ListItem.displayName = "ListItem"

  // Custom transparent style for top-level items to blend better
  // Increased font-size to text-base
  const customTriggerStyle = cn(
    navigationMenuTriggerStyle(),
    "bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-emerald-700 dark:hover:text-emerald-400 data-[state=open]:bg-slate-100/50 dark:data-[state=open]:bg-slate-800/50 h-10 px-4 text-base font-medium"
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 mr-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg group-hover:bg-primary/90 transition-colors shadow-sm">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">
                {t('meta.title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Menu (Right Aligned) */}
          <div className="hidden md:flex flex-1 justify-end items-center mr-4">
              <NavigationMenu>
                  <NavigationMenuList className="space-x-1">
                      {navItems.map((item) => {
                          // CASE 1: Simple Link
                          if (!item.groups && !(item as any).children) {
                              return (
                                  <NavigationMenuItem key={item.path}>
                                      <NavigationMenuLink asChild className={customTriggerStyle}>
                                          <Link 
                                              to={item.path}
                                              className={cn(
                                                  customTriggerStyle,
                                                  isActive(item.path) && "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10"
                                              )}
                                          >
                                              {item.label}
                                          </Link>
                                      </NavigationMenuLink>
                                  </NavigationMenuItem>
                              )
                          }

                          // CASE 2: Dropdown with Children (Simple list)
                          if ((item as any).children) {
                              return (
                                  <NavigationMenuItem key={item.path}>
                                      <NavigationMenuTrigger className={cn(customTriggerStyle, isActive(item.path) && "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10")}>
                                          {item.label}
                                      </NavigationMenuTrigger>
                                      <NavigationMenuContent>
                                          <ul className="grid w-[320px] gap-2 p-3 md:w-[380px]">
                                              {(item as any).children.map((subItem: any) => (
                                                  <ListItem 
                                                      key={subItem.path} 
                                                      href={subItem.path} 
                                                      title={subItem.label}
                                                      icon={subItem.icon}
                                                  >
                                                      {subItem.desc || subItem.label}
                                                  </ListItem>
                                              ))}
                                          </ul>
                                      </NavigationMenuContent>
                                  </NavigationMenuItem>
                              )
                          }

                          // CASE 3: Mega Menu (Groups)
                          if (item.groups) {
                              return (
                                  <NavigationMenuItem key={item.path}>
                                      <NavigationMenuTrigger className={cn(customTriggerStyle, isActive(item.path) && "text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10")}>
                                          {item.label}
                                      </NavigationMenuTrigger>
                                      <NavigationMenuContent>
                                          <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[650px]">
                                              {item.groups.map((group, idx) => (
                                                  <div key={idx} className="space-y-1">
                                                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                                                          {group.title}
                                                      </h4>
                                                      <ul className="space-y-1">
                                                          {group.items.map((subItem) => (
                                                              <li key={subItem.path}>
                                                                  <NavigationMenuLink asChild>
                                                                      <Link
                                                                          to={subItem.path}
                                                                          className="group block select-none rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
                                                                      >
                                                                          <div className="flex items-start gap-4">
                                                                              <div className="flex-shrink-0 p-2.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200/80 dark:group-hover:bg-emerald-900/50 transition-colors">
                                                                                  <subItem.icon className="h-5 w-5" />
                                                                              </div>
                                                                              <div className="flex flex-col gap-1">
                                                                                  <div className="text-base font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                                                                      {subItem.label}
                                                                                  </div>
                                                                                  {subItem.desc && (
                                                                                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                                                                          {subItem.desc}
                                                                                      </p>
                                                                                  )}
                                                                              </div>
                                                                          </div>
                                                                      </Link>
                                                                  </NavigationMenuLink>
                                                              </li>
                                                          ))}
                                                      </ul>
                                                  </div>
                                              ))}
                                          </div>
                                      </NavigationMenuContent>
                                  </NavigationMenuItem>
                              )
                          }
                          return null;
                      })}
                  </NavigationMenuList>
              </NavigationMenu>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hidden md:flex"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile menu button (Hamburger) */}
            <div className="md:hidden flex items-center gap-2">
               <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground"
              >
                {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 bg-background border-l border-border">
                  <div className="flex flex-col h-full py-6 overflow-y-auto">
                    <div className="px-6 mb-6 flex items-center gap-2">
                      <div className="bg-primary p-1.5 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-xl text-foreground">Menu</span>
                    </div>
                    
                    <div className="flex-1 px-4 space-y-2">
                      {navItems.map((item) => (
                        <React.Fragment key={item.path}>
                          {!item.groups && !(item as any).children ? (
                            <SheetClose asChild>
                              <Link
                                to={item.path}
                                className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                                  isActive(item.path)
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                    : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                                }`}
                              >
                                {item.label}
                              </Link>
                            </SheetClose>
                          ) : (
                            <div className="px-2 py-2">
                              <div className="font-bold text-lg text-foreground mb-3 px-2">
                                {item.label}
                              </div>
                              
                              {item.groups ? (
                                  <div className="space-y-4 ml-2 border-l-2 border-border pl-4">
                                      {item.groups.map((group, idx) => (
                                      <div key={idx}>
                                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                          {group.title}
                                          </div>
                                          <div className="space-y-1">
                                          {group.items.map((subItem) => (
                                              <SheetClose asChild key={subItem.path}>
                                                <Link
                                                  to={subItem.path}
                                                  className="flex items-start gap-3 py-3 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                                                        <subItem.icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-medium text-foreground">
                                                            {subItem.label}
                                                        </div>
                                                        {subItem.desc && (
                                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                                {subItem.desc}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                              </SheetClose>
                                          ))}
                                          </div>
                                      </div>
                                      ))}
                                  </div>
                              ) : (item as any).children ? (
                                <div className="space-y-1 ml-2 border-l-2 border-border pl-4">
                                  {(item as any).children.map((subItem: any) => (
                                    <SheetClose asChild key={subItem.path}>
                                      <Link
                                        to={subItem.path}
                                        className="flex items-start gap-3 py-3 px-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                         <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                                            <subItem.icon className="h-5 w-5" />
                                         </div>
                                         <div>
                                            <div className="text-base font-medium text-foreground">
                                                {subItem.label}
                                            </div>
                                            {subItem.desc && (
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {subItem.desc}
                                                </div>
                                            )}
                                         </div>
                                      </Link>
                                    </SheetClose>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};