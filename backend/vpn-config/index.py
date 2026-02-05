import json
import os
import secrets
import base64
from typing import Dict, Any

def generate_wireguard_keys() -> Dict[str, str]:
    """Генерирует пару приватный/публичный ключ для WireGuard"""
    private_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
    
    public_bytes = secrets.token_bytes(32)
    public_key = base64.b64encode(public_bytes).decode('utf-8')
    
    return {
        'private_key': private_key,
        'public_key': public_key
    }

def generate_config(server_country: str, private_key: str) -> str:
    """Генерирует конфигурационный файл WireGuard"""
    
    server_endpoints = {
        'США': '198.51.100.10:51820',
        'Великобритания': '203.0.113.20:51820',
        'Германия': '192.0.2.30:51820',
        'Япония': '198.18.0.40:51820',
        'Австралия': '198.18.1.50:51820',
        'Сингапур': '198.18.2.60:51820',
        'Канада': '198.18.3.70:51820',
        'Франция': '198.18.4.80:51820',
    }
    
    server_public_keys = {
        'США': 'ServerPublicKey1ABC==',
        'Великобритания': 'ServerPublicKey2DEF==',
        'Германия': 'ServerPublicKey3GHI==',
        'Япония': 'ServerPublicKey4JKL==',
        'Австралия': 'ServerPublicKey5MNO==',
        'Сингапур': 'ServerPublicKey6PQR==',
        'Канада': 'ServerPublicKey7STU==',
        'Франция': 'ServerPublicKey8VWX==',
    }
    
    config = f"""[Interface]
PrivateKey = {private_key}
Address = 10.8.0.2/24
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = {server_public_keys.get(server_country, 'DefaultServerKey==')}
Endpoint = {server_endpoints.get(server_country, '198.51.100.1:51820')}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
"""
    return config

def handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """
    API для управления VPN конфигурациями:
    GET /vpn-config - генерирует новые ключи
    POST /vpn-config - создаёт конфиг для сервера
    """
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        keys = generate_wireguard_keys()
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(keys),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            server_country = body.get('server_country', 'США')
            private_key = body.get('private_key')
            
            if not private_key:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'private_key required'}),
                    'isBase64Encoded': False
                }
            
            config = generate_config(server_country, private_key)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'config': config,
                    'server': server_country
                }),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
