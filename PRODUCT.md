# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Groups of friends who already play together in a fantasy football league
(Biwenger, Comunio, or a generic Fantasy). They arrive as a group, not as
solo competitors, and use CastigosFantasy to add fun, banter, and
consequences on top of the league they already run. The core job is social:
assign and track *castigos*, laugh together, and keep the group engaged
week to week.

## Product Purpose

CastigosFantasy is the castigos-and-community layer that sits on top of an
existing fantasy league. It exists to turn league results into shared
entertainment — punishments for the losers/morosos, a ruleta, botes, and
community spaces where the group hangs out and jokes around. Success is a
group that keeps coming back to laugh together, not a user who climbs a
leaderboard.

## Positioning

Not a fantasy-strategy tool and not a replacement league manager. Its
meaningfully different value is the social/punishment layer — castigos,
ruleta de morosos, botes, and community surfaces (foro, muro, comunidad,
duelos, juegos, guías) — layered onto the league you already play in
Biwenger/Comunio. A plain fantasy app tracks the competition; CastigosFantasy
makes the group's shared humor and consequences the point.

## Operating Context

Used alongside an external fantasy platform (Biwenger / Comunio / generic
Fantasy) whose data it syncs. A group typically has an organizer plus members;
usage is recurring and tied to the fantasy season's matchday rhythm.
Spanish-speaking (Spain, es_ES) audience.

## Capabilities and Constraints

- Confirmed surfaces in the app: landing, dashboard, league hub, select-league,
  roulette (ruleta de morosos), generator, castigos, challenges, duelo, juegos/
  minigame, foro, muro, comunidad, top10, players hub, herramientas, guías,
  bufón, about, legal, auth.
- Biwenger and Comunio sync are core, must-keep capabilities (login, members,
  standings). Comunio standings depend on the 2026-27 season being live.
- Backend is Supabase (auth + data); this is a durable constraint.
- Built with Vite; deployed at https://castigosfantasy.com.

## Brand Commitments

- Name: CastigosFantasy.
- Voice: Spanish (es_ES), informal and humorous — banter-forward, made for
  laughing with friends.
- A shield + skeleton logo and green palette exist in the repo and are the
  current identity, but were not made a binding constraint during init.

## Evidence on Hand

- Working Biwenger integration and Comunio sync (login + members). Comunio
  standings are empty until the 2026-27 season begins.
- Logo assets and a castigos catalog (`castigos-fantasy-catalogo.xlsx`) exist
  in the repo. No testimonials, user counts, or benchmarks are established —
  future work must not fabricate them.

## Product Principles

- Community and humor first; never drift into a fantasy-strategy or
  optimization tool.
- Layer onto the group's existing league — complement Biwenger/Comunio,
  don't try to replace them.
- Keep it a group experience: everything should give friends something to
  laugh about or react to together.
- Spanish, informal, and playful in every surface and every string.
