import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { VPNManager, VPNConfig } from '@/utils/vpn-native';

const VPN_API_URL = 'https://functions.poehali.dev/0a61a141-1375-4d4c-b126-d1b15d292a15';

const servers = [
  { country: 'США', flag: '🇺🇸', ping: 24, load: 45, endpoint: '198.51.100.10:51820', publicKey: 'USAServerKey123==' },
  { country: 'Великобритания', flag: '🇬🇧', ping: 38, load: 32, endpoint: '203.0.113.20:51820', publicKey: 'UKServerKey456==' },
  { country: 'Германия', flag: '🇩🇪', ping: 42, load: 67, endpoint: '192.0.2.30:51820', publicKey: 'DEServerKey789==' },
  { country: 'Япония', flag: '🇯🇵', ping: 89, load: 28, endpoint: '198.18.0.40:51820', publicKey: 'JPServerKeyABC==' },
  { country: 'Австралия', flag: '🇦🇺', ping: 156, load: 51, endpoint: '198.18.1.50:51820', publicKey: 'AUServerKeyDEF==' },
  { country: 'Сингапур', flag: '🇸🇬', ping: 78, load: 39, endpoint: '198.18.2.60:51820', publicKey: 'SGServerKeyGHI==' },
  { country: 'Канада', flag: '🇨🇦', ping: 31, load: 44, endpoint: '198.18.3.70:51820', publicKey: 'CAServerKeyJKL==' },
  { country: 'Франция', flag: '🇫🇷', ping: 45, load: 58, endpoint: '198.18.4.80:51820', publicKey: 'FRServerKeyMNO==' },
];

const subscriptionPlans = [
  {
    name: 'Free',
    price: '0 ₽',
    period: 'навсегда',
    features: ['1 устройство', '3 страны', '10 ГБ в месяц', 'Базовая скорость'],
    icon: 'Zap',
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Premium',
    price: '299 ₽',
    period: 'в месяц',
    features: ['5 устройств', '8 стран', 'Безлимитный трафик', 'Максимальная скорость', 'Kill Switch', 'Приоритетная поддержка'],
    icon: 'Crown',
    gradient: 'from-primary to-secondary',
    popular: true
  },
  {
    name: 'Family',
    price: '499 ₽',
    period: 'в месяц',
    features: ['10 устройств', '8 стран', 'Безлимитный трафик', 'Максимальная скорость', 'Kill Switch', 'Приоритетная поддержка', 'Семейный доступ'],
    icon: 'Users',
    gradient: 'from-accent to-secondary'
  }
];

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [speed, setSpeed] = useState(0);
  const [traffic, setTraffic] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [autoConnect, setAutoConnect] = useState(false);
  const [killSwitch, setKillSwitch] = useState(true);
  const [protocol, setProtocol] = useState('wireguard');
  
  const [userEmail] = useState('user@example.com');
  const [subscription, setSubscription] = useState('Premium');
  
  const [showMenu, setShowMenu] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'servers' | 'stats' | 'settings' | 'profile'>('home');

  useEffect(() => {
    if (isConnected) {
      document.title = '🔒 VPN Подключен - SecureVPN';
    } else {
      document.title = 'SecureVPN';
    }
  }, [isConnected]);

  useEffect(() => {
    let speedInterval: number;
    let trafficInterval: number;
    let durationInterval: number;

    if (isConnected) {
      speedInterval = window.setInterval(() => {
        const vpnStatus = VPNManager.getStatus();
        if (vpnStatus.connected) {
          setSpeed(Math.floor(Math.random() * 50) + 50);
        }
      }, 1000);
      
      trafficInterval = window.setInterval(() => {
        setTraffic(prev => prev + Math.random() * 0.5);
      }, 1000);
      
      durationInterval = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (speedInterval) clearInterval(speedInterval);
      if (trafficInterval) clearInterval(trafficInterval);
      if (durationInterval) clearInterval(durationInterval);
    };
  }, [isConnected]);

  const generateKeys = async () => {
    try {
      const response = await fetch(VPN_API_URL);
      const keys = await response.json();
      return keys;
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать ключи',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleConnect = async () => {
    if (!isConnected) {
      setIsConnecting(true);
      
      toast({
        title: 'Подключение...',
        description: 'Генерация WireGuard ключей',
      });
      
      const keys = await generateKeys();
      if (!keys) {
        setIsConnecting(false);
        return;
      }
      
      const vpnConfig: VPNConfig = {
        privateKey: keys.private_key,
        publicKey: keys.public_key,
        serverEndpoint: selectedServer.endpoint,
        serverPublicKey: selectedServer.publicKey,
        clientIP: `10.8.0.${Math.floor(Math.random() * 250) + 2}`,
        dns: ['1.1.1.1', '1.0.0.1']
      };
      
      const connected = await VPNManager.connect(vpnConfig);
      
      if (connected) {
        setIsConnected(true);
        toast({
          title: '✅ Подключено',
          description: `Сервер: ${selectedServer.country}`,
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: 'Не удалось установить VPN соединение',
          variant: 'destructive',
        });
      }
      
      setIsConnecting(false);
    } else {
      setIsConnecting(true);
      
      const disconnected = await VPNManager.disconnect();
      
      if (disconnected) {
        setIsConnected(false);
        setSpeed(0);
        setTraffic(0);
        setDuration(0);
        toast({
          title: 'Отключено',
          description: 'VPN соединение разорвано',
        });
      }
      
      setIsConnecting(false);
    }
  };

  const handleServerSelect = async (server: typeof servers[0]) => {
    if (isConnected) {
      toast({
        title: 'Переподключение...',
        description: `Смена сервера на ${server.country}`,
      });
      
      await VPNManager.disconnect();
      setSelectedServer(server);
      
      const keys = await generateKeys();
      if (keys) {
        const vpnConfig: VPNConfig = {
          privateKey: keys.private_key,
          publicKey: keys.public_key,
          serverEndpoint: server.endpoint,
          serverPublicKey: server.publicKey,
          clientIP: `10.8.0.${Math.floor(Math.random() * 250) + 2}`,
          dns: ['1.1.1.1', '1.0.0.1']
        };
        
        await VPNManager.connect(vpnConfig);
        
        toast({
          title: '✅ Переподключено',
          description: `Новый сервер: ${server.country}`,
        });
      }
    } else {
      setSelectedServer(server);
    }
    
    setCurrentView('home');
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMenuItemClick = (view: typeof currentView) => {
    setCurrentView(view);
    setShowMenu(false);
  };

  const handleSubscriptionSelect = (plan: string) => {
    setSubscription(plan);
    setShowSubscriptions(false);
    toast({
      title: 'Подписка изменена',
      description: `Активирован план ${plan}`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-safe">
      {isConnected && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary py-2 px-4 flex items-center justify-center gap-2 text-white text-sm font-medium shadow-lg">
          <Icon name="ShieldCheck" size={16} />
          <span className="text-xs sm:text-sm">{selectedServer.country} • {selectedServer.ping}ms</span>
        </div>
      )}
      
      <div className={`container mx-auto px-3 sm:px-4 max-w-2xl ${isConnected ? 'pt-12' : 'pt-3'} pb-4`}>
        <header className="mb-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-40 py-3 -mx-3 px-3 sm:-mx-4 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <Icon name="Shield" size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">SecureVPN</h1>
              <Badge className="text-xs px-1.5 py-0 h-4">{subscription}</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowSubscriptions(true)}
            >
              <Icon name="Crown" size={18} />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Icon name="MoreVertical" size={18} />
            </Button>
          </div>
        </header>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setShowMenu(false)}
            />
            <div className="fixed right-3 top-16 sm:right-4 sm:top-20 bg-card border border-border rounded-2xl shadow-2xl z-50 w-64 overflow-hidden animate-fade-in">
              <div className="p-2">
                <button
                  onClick={() => handleMenuItemClick('home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'home' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon name="Home" size={20} />
                  <span className="font-medium">Главная</span>
                </button>
                
                <button
                  onClick={() => handleMenuItemClick('servers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'servers' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon name="Globe" size={20} />
                  <span className="font-medium">Серверы</span>
                </button>
                
                <button
                  onClick={() => handleMenuItemClick('stats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'stats' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon name="BarChart3" size={20} />
                  <span className="font-medium">Статистика</span>
                </button>
                
                <button
                  onClick={() => handleMenuItemClick('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon name="Settings" size={20} />
                  <span className="font-medium">Настройки</span>
                </button>
                
                <button
                  onClick={() => handleMenuItemClick('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    currentView === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon name="User" size={20} />
                  <span className="font-medium">Профиль</span>
                </button>

                <div className="h-px bg-border my-2" />
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    toast({
                      title: 'Выход',
                      description: 'Вы вышли из аккаунта',
                    });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Icon name="LogOut" size={20} />
                  <span className="font-medium">Выйти</span>
                </button>
              </div>
            </div>
          </>
        )}

        {showSubscriptions && (
          <>
            <div 
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setShowSubscriptions(false)}
            >
              <div 
                className="bg-background rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 sm:p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold">Выберите подписку</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSubscriptions(false)}
                  >
                    <Icon name="X" size={24} />
                  </Button>
                </div>

                <div className="p-4 sm:p-6 space-y-3">
                  {subscriptionPlans.map((plan) => (
                    <button
                      key={plan.name}
                      onClick={() => handleSubscriptionSelect(plan.name)}
                      className={`w-full p-4 sm:p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                        subscription === plan.name
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                            Популярный
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3 sm:gap-4 mb-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={plan.icon as any} size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">{plan.name}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                            <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-4">
          {currentView === 'home' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="p-6 sm:p-8 bg-card border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
                
                <div className="relative space-y-6 sm:space-y-8">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={isConnected ? "default" : "secondary"} className="px-3 py-1">
                        {isConnected ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Защищено
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
                            Не защищено
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {isConnected ? 'Вы под защитой' : 'Подключитесь к VPN'}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground px-4">
                      {isConnected 
                        ? `${selectedServer.country} • ${selectedServer.ping}ms • WireGuard`
                        : 'Нажмите кнопку для безопасного подключения'
                      }
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 transition-all duration-300 flex items-center justify-center disabled:opacity-50 ${
                        isConnected 
                          ? 'border-primary bg-primary/20 glow-primary animate-pulse-glow' 
                          : 'border-muted bg-card hover:border-primary/50 active:scale-95'
                      }`}
                    >
                      {isConnecting ? (
                        <Icon name="Loader2" size={56} className="text-primary animate-spin sm:w-16 sm:h-16" />
                      ) : (
                        <Icon 
                          name={isConnected ? "ShieldCheck" : "Shield"} 
                          size={56} 
                          className={isConnected ? "text-primary sm:w-16 sm:h-16" : "text-muted-foreground sm:w-16 sm:h-16"}
                        />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Card className="p-3 sm:p-4 bg-card/50 border-border text-center">
                      <Icon name="Zap" size={18} className="text-primary mx-auto mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold">{speed}</div>
                      <div className="text-xs text-muted-foreground">Мбит/с</div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4 bg-card/50 border-border text-center">
                      <Icon name="ArrowDownUp" size={18} className="text-secondary mx-auto mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold">{traffic.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">ГБ</div>
                    </Card>
                    
                    <Card className="p-3 sm:p-4 bg-card/50 border-border text-center">
                      <Icon name="Clock" size={18} className="text-accent mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-xl font-bold">{formatDuration(duration)}</div>
                      <div className="text-xs text-muted-foreground">Время</div>
                    </Card>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-3">
                <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all active:scale-[0.98]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Lock" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Шифрование AES-256</h3>
                      <p className="text-sm text-muted-foreground">Военное шифрование данных</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border hover:border-secondary/50 transition-all active:scale-[0.98]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="EyeOff" size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Без логов</h3>
                      <p className="text-sm text-muted-foreground">Полная анонимность</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border hover:border-accent/50 transition-all active:scale-[0.98]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Rocket" size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Kill Switch {killSwitch && '✓'}</h3>
                      <p className="text-sm text-muted-foreground">Автозащита при разрыве</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'servers' && (
            <div className="space-y-3 animate-fade-in">
              <Card className="p-4 sm:p-6 bg-card border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Globe" size={24} className="text-primary" />
                  Глобальная сеть серверов
                </h2>
                <div className="space-y-2">
                  {servers.map((server) => (
                    <button
                      key={server.country}
                      onClick={() => handleServerSelect(server)}
                      disabled={isConnecting}
                      className={`w-full p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] disabled:opacity-50 ${
                        selectedServer.country === server.country
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl sm:text-3xl">{server.flag}</span>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{server.country}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {server.ping}ms
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Загрузка</div>
                          <div className="font-semibold text-sm">{server.load}%</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {currentView === 'stats' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="p-4 sm:p-6 bg-card border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="BarChart3" size={24} className="text-primary" />
                  Статистика
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Скорость</span>
                      <span className="font-semibold text-sm sm:text-base">{speed} Мбит/с</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${Math.min((speed / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Трафик</span>
                      <span className="font-semibold text-sm sm:text-base">{traffic.toFixed(2)} ГБ</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-300"
                        style={{ width: `${Math.min((traffic / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
                    <Card className="p-3 sm:p-4 bg-card/50 border-border">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon name="Timer" size={20} className="text-primary sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-bold">{formatDuration(duration)}</div>
                          <div className="text-xs text-muted-foreground">Время</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3 sm:p-4 bg-card/50 border-border">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <Icon name="Activity" size={20} className="text-secondary sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-bold">{selectedServer.ping}ms</div>
                          <div className="text-xs text-muted-foreground">Пинг</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="p-4 sm:p-6 bg-card border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="Settings" size={24} className="text-primary" />
                  Настройки
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <Label htmlFor="auto-connect" className="text-sm sm:text-base font-semibold">Автозапуск</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Автоматическое подключение</p>
                    </div>
                    <Switch 
                      id="auto-connect" 
                      checked={autoConnect}
                      onCheckedChange={setAutoConnect}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <Label htmlFor="kill-switch" className="text-sm sm:text-base font-semibold">Kill Switch</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Блокировка при разрыве</p>
                    </div>
                    <Switch 
                      id="kill-switch" 
                      checked={killSwitch}
                      onCheckedChange={setKillSwitch}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base font-semibold">Протокол</Label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => setProtocol('wireguard')}
                        className={`p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                          protocol === 'wireguard'
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border bg-card/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold text-sm mb-1">WireGuard</div>
                        <div className="text-xs text-muted-foreground">Быстрый</div>
                      </button>
                      
                      <button
                        onClick={() => setProtocol('openvpn')}
                        className={`p-3 sm:p-4 rounded-xl border transition-all text-left active:scale-[0.98] ${
                          protocol === 'openvpn'
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border bg-card/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold text-sm mb-1">OpenVPN</div>
                        <div className="text-xs text-muted-foreground">Надёжный</div>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="p-4 sm:p-6 bg-card border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                  <Icon name="User" size={24} className="text-primary" />
                  Профиль
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base">{userEmail}</div>
                      <Badge className="mt-1 text-xs">{subscription}</Badge>
                    </div>
                  </div>

                  <Card className="p-3 sm:p-4 bg-card/50 border-border">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Подписка до</span>
                      <span className="font-semibold">31.12.2026</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4" />
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 sm:p-4 bg-card/50 border-border text-center">
                      <Icon name="Zap" size={20} className="text-primary mx-auto mb-2 sm:w-6 sm:h-6" />
                      <div className="text-xl sm:text-2xl font-bold">∞</div>
                      <div className="text-xs text-muted-foreground">Трафик</div>
                    </Card>

                    <Card className="p-3 sm:p-4 bg-card/50 border-border text-center">
                      <Icon name="Globe" size={20} className="text-secondary mx-auto mb-2 sm:w-6 sm:h-6" />
                      <div className="text-xl sm:text-2xl font-bold">8</div>
                      <div className="text-xs text-muted-foreground">Стран</div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Устройства</h3>
                    <Card className="p-3 bg-card/50 border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Smartphone" size={18} className="text-primary" />
                        <div>
                          <div className="font-medium text-sm">Текущее устройство</div>
                          <div className="text-xs text-muted-foreground">Активен сейчас</div>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </Card>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6 bg-card border-border">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} className="text-primary" />
                  Поддержка
                </h2>
                
                <div className="space-y-2">
                  <Button className="w-full justify-start text-sm" variant="ghost">
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Чат с поддержкой
                  </Button>
                  
                  <Button className="w-full justify-start text-sm" variant="ghost">
                    <Icon name="Mail" size={16} className="mr-2" />
                    Email
                  </Button>
                  
                  <Button className="w-full justify-start text-sm" variant="ghost">
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    База знаний
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
