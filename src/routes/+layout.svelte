<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import type { UserCookiesSchema } from './home/user-schema';
	let { children, data } = $props();
	const user: UserCookiesSchema | undefined = data.user;
	let isDrawerOpen = $state(false);
	async function logout() {
		const res = await fetch('/logout', { method: 'POST' });
		if (res.ok) goto('/', { invalidateAll: true });
	}
</script>

<Toaster position="top-center"></Toaster>
<svelte:head>
	<link
		href="https://cdn.jsdelivr.net/npm/daisyui@2/dist/full.css"
		rel="stylesheet"
		type="text/css"
	/>
</svelte:head>

<div>
	{#if data.isLoggedIn}
		<div class="navbar w-full gap-2 bg-gradient-to-br from-cyan-500 to-blue-800 text-white">
			<div class="sm:hidden md:hidden lg:block">
				<div class="flex w-full flex-row items-center justify-between">
					<div>
						<img
							src="src/lib/assets/images/uph_logo.jpg"
							alt="logo uph"
							class="h-10 w-10 rounded-full"
						/>
					</div>
					<div>
						<span class="text-white">Universitas Pelita Harapan Medan Campus</span>
					</div>
					<div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button
									variant="ghost"
									class="rounded-md text-white hover:bg-white hover:text-blue-500"
								>
									<span>Profile</span>
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56" align="end">
								<DropdownMenu.Label class="font-normal">
									<div class="flex flex-col space-y-1">
										<p class="text-sm font-medium leading-none">{user?.username}</p>
										<p class="text-xs leading-none text-muted-foreground">{user?.email}</p>
									</div>
								</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<button
									type="submit"
									onclick={logout}
									class="rounded-md p-2 transition ease-in hover:bg-black hover:text-white"
								>
									<span>Log out</span>
								</button>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			</div>
			<div class="flex-none lg:hidden">
				<label
					for="my-drawer-3"
					class:swap-active={isDrawerOpen}
					class="btn btn-circle swap swap-rotate"
				>
					<svg
						class="swap-off fill-current"
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 512 512"
						><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg
					>
					<svg
						class="swap-on fill-current"
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 512 512"
						><polygon
							points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49"
						/></svg
					>
				</label>
			</div>
		</div>
	{/if}

	<div class="drawer h-full w-full">
		<input id="my-drawer-3" type="checkbox" bind:checked={isDrawerOpen} class="drawer-toggle" />
		<div class="drawer-content flex flex-col items-center justify-center">
			<main class="w-full">
				{@render children?.()}
			</main>
		</div>
		<div class="drawer-side">
			<label for="my-drawer-3" class="drawer-overlay"></label>
			<ul class="menu w-80 overflow-y-auto bg-white p-4">
				<li class="lg:hidden">
					<img
						src="src/lib/assets/images/uph_logo.jpg"
						alt="logo uph"
						class="swap-off h-20 w-24 rounded-full"
					/>
				</li>
				<li><span>Sidebar Item 1</span></li>
				<li><span>Sidebar Item 2</span></li>
			</ul>
		</div>
	</div>
</div>
