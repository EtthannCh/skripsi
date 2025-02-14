<script lang="ts">
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar/app-sidebar.svelte';
	import { HouseIcon, InboxIcon, Menu, X } from 'lucide-svelte';
	import type { UserCookiesSchema } from './home/request-user-schema';

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
</script>

<svelte:window bind:innerWidth={windowWidth} />
{#if !isMobile}
	<Sidebar.Provider data-sveltekit-reload bind:open={openSidebar}>
		<AppSidebar {user} majorData={data.majorDb} />
		<main class="w-full bg-gray-100">
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
	<main class="w-full h-full bg-gray-100">
		<Sheet.Root>
			<Sheet.Trigger class={`${buttonVariants({ variant: 'outline' })} mx-10 my-3`}
				>Open Sidebar</Sheet.Trigger
			>
			<Sheet.Content side="left" class="w-[200px]">
				<Sheet.Header>
					<Sheet.Title class="my-3 flex flex-row items-center gap-5">
						<img src={uphLogo} alt="logo uph" class="h-10 w-10 rounded-full" />
						<span>UPH MEDAN</span>
					</Sheet.Title>
				</Sheet.Header>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<HouseIcon/>
						<a href="/home">Home</a>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<InboxIcon/>
						<a href="#">Inbox</a>
					</div>
				</div>
				<Sheet.Footer>
					<span class="flex flex-col gap-1 overflow-x-scroll">
						<span>
							{`${user.username.toUpperCase()} ( ${data.majorDb.code.toUpperCase()} )`}
						</span>
						<span class="text-sm">
							{user.email}
						</span>
					</span>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
		{@render children?.()}
	</main>
{/if}
