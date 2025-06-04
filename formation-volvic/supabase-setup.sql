-- Création de la table inscriptions_volvic
create table public.inscriptions_volvic (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- Activation de la sécurité ligne à ligne (RLS)
alter table public.inscriptions_volvic enable row level security;

-- Politique d'insertion pour tout public
create policy "Allow insert for all"
  on public.inscriptions_volvic
  for insert
  to public
  with check (true);
