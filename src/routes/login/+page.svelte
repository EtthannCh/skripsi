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

	let { data } = $props();
	let loading = $state(false);

	const form = superForm(data.form.data, {
		validators: zodClient(loginSchema),
		onResult: ({ result }) => {
			loading = false;
			if (result.type == 'success') {
				toast.success('Login Successfully', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home');
				invalidateAll();
			} else {
				toast.error('Credentials Invalid', {
					position: 'top-right',
					dismissable: true
				});
			}
		},
		onSubmit: () => {
			loading = true;
		}
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
<div class="flex min-h-screen flex-col items-center justify-center bg-uph text-white">
	{#if loading}
		<span class="h-10">
			<SyncLoader color="#007bff" />
		</span>
	{/if}
	<h1 class="my-5 text-[36px]">LOGIN</h1>
	<div class={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center gap-10`}>
		<img src={uphLogo} class="h-[250px] w-[250px] rounded-full" alt="uph_logo" />
		<form method="POST" use:enhance action="?/login">
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
					<Input {...attrs} bind:value={$formData.password} type="password" class="text-black" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="my-5 flex flex-col">
				<span
					>No Account? <a href="../register" class="group relative text-white no-underline">
						Register Here
						<span
							class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-white transition-transform group-hover:origin-left group-hover:scale-x-100"
						></span>
					</a></span
				>
				<span class="flex w-full items-center justify-center"
					><a href="/forgot-password" class="group relative text-white no-underline">
						Forgot Password
						<span
							class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-white transition-transform group-hover:origin-left group-hover:scale-x-100"
						></span>
					</a></span
				>
				<button class="my-3 rounded-md bg-uphButton p-2"> Login </button>
			</div>
		</form>
	</div>
</div>
