<script lang="ts">
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import type { UserCookiesSchema } from './home/request-user-schema';
	import uphLogo from '../lib/assets/images/uph_logo.jpg';
	import { toast } from 'svelte-sonner';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar/app-sidebar.svelte';

	let { children, data } = $props();
	const user: UserCookiesSchema | undefined = data.user;
	let isDrawerOpen = $state(false);
	async function logout() {
		const res = await fetch('/logout', { method: 'POST' });
		if (res.ok) goto('/', { invalidateAll: true });
	}
</script>

<Toaster richColors position="top-right"></Toaster>

<Sidebar.Provider style="--sidebar:width:20rem; --sidebar-width-mobile:20rem;" data-sveltekit-reload open={false}>
	{#if data.isLoggedIn && user && data.majorDb}
		<AppSidebar {user} majorData={data.majorDb}/>
	{/if}
	<main class="w-full bg-gray-100">
		{#if data.isLoggedIn}
			<Sidebar.Trigger/>
		{/if}
		{@render children?.()}
	</main>
</Sidebar.Provider>