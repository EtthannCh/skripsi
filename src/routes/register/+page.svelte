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
	import { navigating } from '$app/state';

	// data ini merupakan hasil balikkan dari load di +page.server.ts
	let { data } = $props();

	// variable loading merupakan penanda jika form sedang di submit atau sudah selesai
	let loading = $state(false);

	// library form yang dipakai
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
				// yang return fail di +page.server.ts akan masuk ke dalam block if ini
				toast.error(result.data?.message ?? 'Please Fill In the Form with Required Data', {
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

	// kode dibawah ini untuk mengecek jika screen size adalah mobile atau bukan
	let isMobile = $state(false);
	let windowWidth = $state(0);
	$effect(() => {
		if (windowWidth > 1000) {
			isMobile = false;
		} else {
			isMobile = true;
		}
	});

	// mengakses propery yang ada di dalam variable 'form'
	const { form: formData, enhance } = form;
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div class="flex min-h-screen flex-col items-center justify-center bg-slate-300 text-white">
	<div
		class={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center gap-10 rounded-md bg-white`}
	>
		<div class="flex h-[650px] w-[350px] items-center justify-center rounded-l-lg bg-uph">
			<img src={uphLogo} class="h-[250px] w-[250px] rounded-full" alt="uph_logo" />
		</div>
		{#if loading || navigating.to}
			<span class="flex h-10 w-[350px] flex-col items-center justify-center">
				<SyncLoader color="#007bff" />
			</span>
		{:else}
			<div
				class="flex h-[650px] w-[350px] flex-col items-center justify-center rounded-md p-10 text-black"
			>
				<h1 class="my-5 text-[36px]">REGISTER</h1>
				<form method="POST" use:enhance action="?/register">
					<!-- lihat dokumentasi superform / formsnap untuk lebih jelasnya terkait form -->
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
								class="group relative text-black no-underline"
							>
								Login
								<span
									class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-uphButton transition-transform group-hover:origin-left group-hover:scale-x-100"
								></span>
							</a></span
						>
						<button class="my-3 rounded-md bg-uphButton p-2 text-white">Register</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
