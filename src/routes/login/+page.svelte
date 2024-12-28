<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from './login-schema';
	import { toast } from 'svelte-sonner';
	import { goto, invalidateAll } from '$app/navigation';
	let { data } = $props();
	const form = superForm(data.form.data, {
		validators: zodClient(loginSchema),
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success('Login Successfully', {
					position: 'top-right',
					dismissable: true
				});
				goto('../home');
				invalidateAll();
			} else {
				toast.info('Credentials Invalid', {
					position: 'top-right',
					dismissable: true
				});
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-800"
>
	<h1 class="my-5">LOGIN</h1>
	<div class="flex items-center justify-center gap-10">
		<img
			src="src/lib/assets/images/uph_logo.jpg"
			class="h-[250px] w-[250px] rounded-full"
			alt="uph_logo"
		/>
		<form method="POST" use:enhance action="?/login">
			<Form.Field {form} name="email">
				<Form.Control let:attrs>
					<Form.Label>Email</Form.Label>
					<Input {...attrs} bind:value={$formData.email} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Form.Label>Password</Form.Label>
					<Input {...attrs} bind:value={$formData.password} type="password" />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="my-5 flex flex-col">
				<span
					>No Account? <a href="../register" class="group relative text-[#18272F] no-underline">
						Register Here
						<span
							class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
						></span>
					</a></span
				>
				<Form.Button class="bg-black text-white hover:bg-white hover:text-black">Login</Form.Button>
			</div>
		</form>
	</div>
</div>
