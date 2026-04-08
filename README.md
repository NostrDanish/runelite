# RuneLite Web

An OSRS-inspired MMORPG running entirely on Nostr with Lightning sats economy.

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2FNostrDanish%2Frunelite.git)

## Features

- **Nostr Login** - Sign in with your Nostr identity (NIP-07), save progress to relays
- **Full Skills System** - Attack, Defence, Strength, Hitpoints, Ranged, Prayer, Magic, Cooking, Woodcutting, Fishing, Firemaking, Crafting, Smithing, Mining, Runecraft
- **Combat** - Fight NPCs from Chickens to Lesser Demons, earn XP and loot
- **Grand Exchange** - Marketplace powered by Nostr events, priced in sats
- **Multiplayer** - See other players on the map, public and trade chat via Nostr
- **Inventory & Equipment** - 28-slot inventory, equip weapons and armor for combat bonuses
- **Sats Economy** - Everything priced in satoshis, earn from combat drops and skilling
- **Responsive** - Works on desktop (WASD/arrows) and mobile (d-pad + tap)
- **Auto-save** - Progress saved to Nostr relays every 60 seconds

## How to Play

1. Login with Nostr or play as guest
2. Use WASD/arrows to move (or d-pad on mobile)
3. Click NPCs to attack, click trees/rocks/fishing spots to skill
4. Open side panels for inventory, stats, equipment, Grand Exchange, chat, and map

## Tech Stack

- React + TypeScript
- HTML5 Canvas for game rendering
- Tailwind CSS for UI
- nostr-tools for Nostr protocol
- NIP-07 for authentication
- NIP-78 (kind 30078) for game data storage
- Kind 1 for chat messages
