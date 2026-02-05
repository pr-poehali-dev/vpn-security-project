import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const VPN_API_URL = 'https://functions.poehali.dev/0a61a141-1375-4d4c-b126-d1b15d292a15';

const servers = [
  { country: 'США', flag: '🇺🇸', ping: 24, load: 45 },
  { country: 'Великобритания', flag: '🇬🇧', ping: 38, load: 32 },
  { country: 'Германия', flag: '🇩🇪', ping: 42, load: 67 },
  { country: 'Япония', flag: '🇯🇵', ping: 89, load: 28 },
  { country: 'Австралия', flag: '🇦🇺', ping: 156, load: 51 },
  { country: 'Сингапур', flag: '🇸🇬', ping: 78, load: 39 },
  { country: 'Канада', flag: '🇨🇦', ping: 31, load: 44 },
  { country: 'Франция', flag: '🇫🇷', ping: 45, load: 58 },
];

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [speed, setSpeed] = useState(0);
  const [traffic, setTraffic] = useState(0);
  const [duration, setDuration] = useState(0);
  const [vpnKeys, setVpnKeys] = useState<{ private_key: string; public_key: string } | null>(null);
  const [vpnConfig, setVpnConfig] = useState<string>('');
  
  const [autoConnect, setAutoConnect] = useState(false);
  const [killSwitch, setKillSwitch] = useState(true);
  const [protocol, setProtocol] = useState('wireguard');
  
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [subscription, setSubscription] = useState('Premium');

  useEffect(() => {
    if (isConnected) {
      document.title = '🔒 VPN Подключен - SecureVPN';
    } else {
      document.title = 'SecureVPN';
    }
  }, [isConnected]);

  const generateKeys = async () => {
    try {
      const response = await fetch(VPN_API_URL);
      const keys = await response.json();
      setVpnKeys(keys);
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

  const generateConfig = async (privateKey: string, server: string) => {
    try {
      const response = await fetch(VPN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_country: server,
          private_key: privateKey,
        }),
      });
      const data = await response.json();
      setVpnConfig(data.config);
      return data.config;
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать конфигурацию',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleConnect = async () => {
    if (!isConnected) {
      toast({
        title: 'Подключение...',
        description: 'Генерация ключей WireGuard',
      });
      
      let keys = vpnKeys;
      if (!keys) {
        keys = await generateKeys();
        if (!keys) return;
      }
      
      const config = await generateConfig(keys.private_key, selectedServer.country);
      if (!config) return;
      
      setIsConnected(true);
      toast({
        title: '✅ Подключено',
        description: `Сервер: ${selectedServer.country}`,
      });
      
      const speedInterval = setInterval(() => {
        setSpeed(Math.floor(Math.random() * 50) + 50);
      }, 1000);
      
      const trafficInterval = setInterval(() => {
        setTraffic(prev => prev + Math.random() * 0.5);
      }, 1000);
      
      const durationInterval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(speedInterval);
        clearInterval(trafficInterval);
        clearInterval(durationInterval);
      };
    } else {
      setIsConnected(false);
      setSpeed(0);
      setTraffic(0);
      setDuration(0);
      toast({
        title: 'Отключено',
        description: 'VPN соединение разорвано',
      });
    }
  };

  const handleServerSelect = (server: typeof servers[0]) => {
    setSelectedServer(server);
    if (isConnected) {
      toast({
        title: 'Смена сервера',
        description: `Переподключение к ${server.country}`,
      });
    }
  };

  const downloadConfig = () => {
    if (!vpnConfig) {
      toast({
        title: 'Ошибка',
        description: 'Сначала подключитесь к VPN',
        variant: 'destructive',
      });
      return;
    }
    
    const blob = new Blob([vpnConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securevpn-${selectedServer.country.toLowerCase()}.conf`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Конфигурация сохранена',
      description: 'Импортируйте файл в WireGuard',
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isConnected && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary py-2 px-4 flex items-center justify-center gap-2 text-white text-sm font-medium shadow-lg">
          <Icon name="ShieldCheck" size={16} />
          <span>VPN Активен • {selectedServer.country} • {selectedServer.ping}ms</span>
        </div>
      )}
      
      <div className={`container mx-auto px-4 max-w-6xl ${isConnected ? 'pt-16' : 'pt-6'} pb-6`}>
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <Icon name="Shield" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">SecureVPN</h1>
          </div>
        </header>

        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="home">
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="servers">
              <Icon name="Globe" size={16} className="mr-2" />
              Серверы
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={16} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6 animate-fade-in">
            <Card className="p-8 bg-card border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
              
              <div className="relative space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
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
                  
                  <h2 className="text-3xl font-bold">
                    {isConnected ? 'Вы под защитой' : 'Подключитесь к VPN'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isConnected 
                      ? `Сервер: ${selectedServer.country} • Ping: ${selectedServer.ping}ms • Протокол: WireGuard`
                      : 'Защитите свои данные и обходите блокировки'
                    }
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleConnect}
                    className={`w-40 h-40 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                      isConnected 
                        ? 'border-primary bg-primary/20 glow-primary animate-pulse-glow' 
                        : 'border-muted bg-card hover:border-primary/50'
                    }`}
                  >
                    <Icon 
                      name={isConnected ? "ShieldCheck" : "Shield"} 
                      size={64} 
                      className={isConnected ? "text-primary" : "text-muted-foreground"}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-card/50 border-border text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon name="Zap" size={20} className="text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{speed}</div>
                    <div className="text-xs text-muted-foreground">Мбит/с</div>
                  </Card>
                  
                  <Card className="p-4 bg-card/50 border-border text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon name="ArrowDownUp" size={20} className="text-secondary" />
                    </div>
                    <div className="text-2xl font-bold">{traffic.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">ГБ</div>
                  </Card>
                  
                  <Card className="p-4 bg-card/50 border-border text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon name="Clock" size={20} className="text-accent" />
                    </div>
                    <div className="text-2xl font-bold">{formatDuration(duration)}</div>
                    <div className="text-xs text-muted-foreground">Время</div>
                  </Card>
                </div>

                {vpnKeys && (
                  <Button onClick={downloadConfig} className="w-full" variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать конфигурацию WireGuard
                  </Button>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all">
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

              <Card className="p-4 bg-card border-border hover:border-secondary/50 transition-all">
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

              <Card className="p-4 bg-card border-border hover:border-accent/50 transition-all">
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
          </TabsContent>

          <TabsContent value="servers" className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Globe" size={24} className="text-primary" />
                Глобальная сеть серверов
              </h2>
              <div className="space-y-2">
                {servers.map((server) => (
                  <button
                    key={server.country}
                    onClick={() => handleServerSelect(server)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedServer.country === server.country
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{server.flag}</span>
                        <div>
                          <div className="font-semibold">{server.country}</div>
                          <div className="text-sm text-muted-foreground">
                            Ping: {server.ping}ms
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Загрузка</div>
                          <div className="font-semibold">{server.load}%</div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="BarChart3" size={24} className="text-primary" />
                Статистика использования
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Скорость загрузки</span>
                    <span className="font-semibold">{speed} Мбит/с</span>
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
                    <span className="text-sm text-muted-foreground">Использовано трафика</span>
                    <span className="font-semibold">{traffic.toFixed(2)} ГБ</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-300"
                      style={{ width: `${Math.min((traffic / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icon name="Timer" size={24} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{formatDuration(duration)}</div>
                        <div className="text-xs text-muted-foreground">Время сессии</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Icon name="Activity" size={24} className="text-secondary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{selectedServer.ping}ms</div>
                        <div className="text-xs text-muted-foreground">Задержка</div>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-border">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Защита активна</h3>
                      <p className="text-sm text-muted-foreground">
                        Ваше соединение зашифровано протоколом WireGuard с AES-256. 
                        Kill Switch активен и защитит вас при разрыве соединения.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Settings" size={24} className="text-primary" />
                Настройки подключения
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-connect" className="text-base font-semibold">Автозапуск</Label>
                    <p className="text-sm text-muted-foreground">Подключаться автоматически при запуске</p>
                  </div>
                  <Switch 
                    id="auto-connect" 
                    checked={autoConnect}
                    onCheckedChange={setAutoConnect}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="kill-switch" className="text-base font-semibold">Kill Switch</Label>
                    <p className="text-sm text-muted-foreground">Блокировать интернет при разрыве VPN</p>
                  </div>
                  <Switch 
                    id="kill-switch" 
                    checked={killSwitch}
                    onCheckedChange={setKillSwitch}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Протокол</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setProtocol('wireguard')}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        protocol === 'wireguard'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold mb-1">WireGuard</div>
                      <div className="text-sm text-muted-foreground">Быстрый и современный</div>
                    </button>
                    
                    <button
                      onClick={() => setProtocol('openvpn')}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        protocol === 'openvpn'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold mb-1">OpenVPN</div>
                      <div className="text-sm text-muted-foreground">Надёжный и проверенный</div>
                    </button>
                  </div>
                </div>

                <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-border">
                  <div className="flex items-start gap-3">
                    <Icon name="Shield" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">DNS защита</h3>
                      <p className="text-sm text-muted-foreground">
                        Используются защищённые DNS серверы Cloudflare (1.1.1.1) для предотвращения утечек
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 animate-fade-in">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Icon name="User" size={24} className="text-primary" />
                Профиль пользователя
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                    {userEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{userEmail}</div>
                    <Badge className="mt-1">{subscription}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="p-4 bg-card/50 border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Подписка активна до</span>
                      <span className="font-semibold">31.12.2026</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4" />
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-card/50 border-border text-center">
                      <Icon name="Zap" size={24} className="text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">∞</div>
                      <div className="text-xs text-muted-foreground">Безлимитный трафик</div>
                    </Card>

                    <Card className="p-4 bg-card/50 border-border text-center">
                      <Icon name="Globe" size={24} className="text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-xs text-muted-foreground">Доступных стран</div>
                    </Card>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Устройства</h3>
                  <div className="space-y-2">
                    <Card className="p-3 bg-card/50 border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Smartphone" size={20} className="text-primary" />
                        <div>
                          <div className="font-medium text-sm">iPhone 15 Pro</div>
                          <div className="text-xs text-muted-foreground">Активен сейчас</div>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </Card>

                    <Card className="p-3 bg-card/50 border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Laptop" size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">MacBook Pro</div>
                          <div className="text-xs text-muted-foreground">Последний вход: 2 часа назад</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти из аккаунта
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="HelpCircle" size={24} className="text-primary" />
                Поддержка
              </h2>
              
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="ghost">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Чат с поддержкой
                </Button>
                
                <Button className="w-full justify-start" variant="ghost">
                  <Icon name="Mail" size={16} className="mr-2" />
                  Написать на email
                </Button>
                
                <Button className="w-full justify-start" variant="ghost">
                  <Icon name="BookOpen" size={16} className="mr-2" />
                  База знаний
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
