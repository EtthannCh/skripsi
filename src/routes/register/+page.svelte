<script lang="ts">
	import { goto } from '$app/navigation';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema } from './register-schema';

	let { data } = $props();
	let loading = $state(false);
	const form = superForm(data.form.data, {
		validators: zodClient(registerSchema),
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-center',
					dismissable: true
				});
				return goto('/verify-user', { invalidateAll: true });
			} else if (result.type == 'failure') {
				toast.error(result.data?.message, {
					position: 'top-right',
					dismissable: true
				});
			}
			loading = false;
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
<div class="flex min-h-screen flex-col items-center justify-center bg-slate-300 text-white">
	<div
		class={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center gap-10 bg-white p-10`}
	>
		
		<img src={uphLogo} class="h-[250px] w-[250px] rounded-full bg-uphButton" alt="uph_logo" />
		{#if loading}
			<span class="h-10">
				<SyncLoader color="#007bff" />
			</span>
		{:else}
			<div
				class="flex w-[350px] flex-col items-center justify-center rounded-md bg-uphButton p-10 text-white"
			>
				<h1 class="my-5 text-[36px]">REGISTER</h1>
				<form method="POST" use:enhance action="?/register">
					<Form.Field {form} name="username">
						<Form.Control let:attrs>
							<Form.Label>Username</Form.Label>
							<Input {...attrs} bind:value={$formData.username} class="text-black" />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
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
					<Form.Field {form} name="confirmPassword">
						<Form.Control let:attrs>
							<Form.Label>Confirm Password</Form.Label>
							<Input
								{...attrs}
								bind:value={$formData.confirmPassword}
								type="password"
								class="text-black"
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<div class="my-5 flex flex-col">
						<span
							>Already has an Account? <a
								href="../login"
								class="group relative text-white no-underline"
							>
								Login
								<span
									class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-white transition-transform group-hover:origin-left group-hover:scale-x-100"
								></span>
							</a></span
						>
						<button class="my-3 rounded-md bg-uph p-2">Register</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
