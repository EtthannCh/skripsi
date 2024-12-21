<script lang="ts">
	import AppSidebar from '$lib/components/ui/sidebar/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	let { children, data } = $props();
	let isDrawerOpen = $state(false);
</script>

<Toaster position="top-center"></Toaster>
<!-- <Sidebar.Provider>
	<AppSidebar></AppSidebar>
	<main>
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider> -->
<svelte:head>
	<link
		href="https://cdn.jsdelivr.net/npm/daisyui@2/dist/full.css"
		rel="stylesheet"
		type="text/css"
	/>
</svelte:head>

<div class="flex h-screen w-full flex-col">
	<div class="navbar w-full gap-2 bg-blue-800">
		<div class="sm:hidden md:hidden lg:block">
			<div class="flex w-full flex-row items-center justify-between">
				<img
					src="src/lib/assets/images/uph_logo.jpg"
					alt="logo uph"
					class="h-10 w-10 rounded-full"
				/>
				<span>tes</span>
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

	<div class="drawer h-full w-full">
		<input id="my-drawer-3" type="checkbox" bind:checked={isDrawerOpen} class="drawer-toggle" />
		<div class="drawer-content flex flex-col items-center justify-center">
			<div class="w-full">
				{@render children?.()}
			</div>
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
