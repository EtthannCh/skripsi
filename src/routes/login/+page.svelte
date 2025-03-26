<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from './login-schema';
	import { toast } from 'svelte-sonner';
	import { goto, invalidateAll } from '$app/navigation';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { navigating, page } from '$app/state';

	let { data } = $props();
	let loading = $state(false);

	const form = superForm(data.form.data, {
		validators: zodClient(loginSchema),
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success('Login Successfully', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home', { invalidateAll: true });
			} else {
				toast.error('Credentials Invalid', {
					position: 'top-right',
					dismissable: true
				});
			}
			loading = false;
			$formData.email = '';
			$formData.password = '';
		},
		onSubmit: () => {
			loading = true;
		},
		multipleSubmits: 'prevent'
	});

	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});
	const { form: formData, enhance } = form;
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div class="flex min-h-screen flex-col items-center justify-center bg-slate-300 text-black">
	<div
		class={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center gap-10 rounded-xl bg-white p-10`}
	>
		<img src={uphLogo} class="h-[250px] w-[250px] rounded-full" alt="uph_logo" />
		{#if navigating.to}
			<span class="h-10">
				<SyncLoader color="#007bff" />
			</span>
		{:else}
			<div class="w-[350px] rounded-md bg-uphButton p-10 items-center justify-center flex flex-col text-white">
				<h1 class="my-5 text-[36px]">LOGIN</h1>
				<form method="POST" use:enhance action="?/login" class=" text-white">
					<Form.Field {form} name="email">
						<Form.Control let:attrs>
							<Form.Label>Email</Form.Label>
							<Input {...attrs} bind:value={$formData.email} class="text-black" />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="password">
						<Form.Control let:attrs>
							<Form.Label>Password</Form.Label>
							<Input
								{...attrs}
								bind:value={$formData.password}
								type="password"
								class="text-black"
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<div class="my-5 flex flex-col">
						<span
							>No Account?
							{#if loading}
								<span class="group relative text-white no-underline">Register Here</span>
							{:else}
								<a href="../register" class="group relative text-white no-underline">
									Register Here
									<span
										class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-white transition-transform group-hover:origin-left group-hover:scale-x-100"
									></span>
								</a>
							{/if}
						</span>
						<span class="flex w-full items-center justify-center">
							{#if loading}
								<span class="group relative text-white no-underline">Forgot Password</span>
							{:else}
								<a href="/forgot-password" class="group relative text-white no-underline">
									Forgot Password
									<span
										class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-white transition-transform group-hover:origin-left group-hover:scale-x-100"
									></span>
								</a>
							{/if}
						</span>
						<button class="my-3 rounded-md bg-uph p-2 text-white" disabled={loading}>
							Login
						</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
