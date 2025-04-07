<script lang="ts">
	import { goto } from '$app/navigation';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar/app-sidebar.svelte';
	import { ChevronUp, HouseIcon, Menu, Users, X } from 'lucide-svelte';
	import * as DropdownMenu from '../../lib/components/ui/dropdown-menu';
	import type { UserCookiesSchema } from './home/request-user-schema';
	import { navigating } from '$app/state';
	import { SyncLoader } from 'svelte-loading-spinners';

	let { children, data } = $props();
	const user: UserCookiesSchema = data.user;
	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});

	let openSidebar = $state(false);
	const logout = async () => {
		const res = await fetch('/logout', { method: 'POST' });
		if (res.ok) goto('/', { invalidateAll: true });
	};
</script>

<svelte:window bind:innerWidth={windowWidth} />
{#if !isMobile}
	<Sidebar.Provider data-sveltekit-reload bind:open={openSidebar}>
		<AppSidebar {user} majorData={data.majorDb} />
		<main class="w-full bg-slate-300">
			<div class="flex items-center sm:hidden md:hidden lg:block">
				{#if openSidebar}
					<X
						class="ml-5 mt-8 hover:cursor-pointer"
						onclick={() => {
							openSidebar = false;
						}}>Close Sidebar</X
					>
				{:else}
					<Menu
						class="ml-5 mt-8 hover:cursor-pointer"
						onclick={() => {
							openSidebar = true;
						}}>Open sidebar</Menu
					>
				{/if}
			</div>
			{@render children?.()}
		</main>
	</Sidebar.Provider>
{:else}
	<main
		class={`${isMobile ? 'flex flex-col gap-5 overflow-hidden' : 'h-full'} w-full bg-slate-300`}
	>
		<Sheet.Root>
			<Sheet.Trigger class={`${buttonVariants({ variant: 'outline' })} mx-10 my-3`}
				>Open Sidebar</Sheet.Trigger
			>
			<Sheet.Content side="left" class="w-[200px] bg-uph text-white" onClose={() => {}}>
				<Sheet.Header>
					<Sheet.Title class="my-3 flex flex-row items-center gap-5 text-white">
						<img src={uphLogo} alt="logo uph" class="h-10 w-10 rounded-full" />
						<span>UPH MEDAN</span>
					</Sheet.Title>
				</Sheet.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<HouseIcon />
						<a href="/home">Home</a>
					</div>
					{#if user.roleId == 6}
						<div class="grid grid-cols-4 items-center gap-4">
							<Users />
							<a href="/user">Role</a>
						</div>
					{/if}
				</div>
				<Sheet.Footer>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton
									{...props}
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-[50px]"
								>
									<span class="flex flex-col gap-1">
										<span>
											{`${user.username.toUpperCase()} ( ${data.majorDb.code.toUpperCase()} )`}
										</span>
										<span class="text-sm">
											{user.email}
										</span>
									</span>

									<ChevronUp class="ml-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
							{#if user.roleId == 3}
								<DropdownMenu.Item>
									<span><a href={`/user/request/${user.id}`}>My Request</a></span>
								</DropdownMenu.Item>
							{/if}
							<DropdownMenu.Item onclick={logout}>
								<span>Log Out</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
		{@render children?.()}
	</main>
{/if}
