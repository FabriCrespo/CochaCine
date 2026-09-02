-- Si ya corriste 20260902: el primer login puede ocupar el asiento de editor.
create or replace function public.claim_editor()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if exists (select 1 from public.editors where user_id = auth.uid()) then
    return true;
  end if;

  if exists (select 1 from public.editors) then
    return false;
  end if;

  insert into public.editors (user_id) values (auth.uid());
  return true;
end;
$$;

revoke all on function public.claim_editor() from public;
grant execute on function public.claim_editor() to authenticated;
