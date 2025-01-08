<script lang="ts">
	import { message } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema } from './register-schema';

	let { data } = $props();
	const form = superForm(data.form.data, {
		validators: zodClient(registerSchema),
		onResult: ({ result }) => {
			if (result.type != 'success') {
				toast.error('Invalid Credentials / Email Has already been used', {
					position: 'top-right',
					dismissable: true
				});
			} else {
				toast.success('Complete your Registration', {
					position: 'top-right',
					dismissable: true
				});
				return goto('/verify-user', { invalidateAll: true });
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-800"
>
	<h1 class="my-5 text-[36px]">REGISTER</h1>
	<div class="w-[750px]">
		<div class="flex items-center justify-center gap-10">
			<img
				src="src/lib/assets/images/uph_logo.jpg"
				class="h-[250px] w-[250px] rounded-full"
				alt="uph_logo"
			/>
			<form method="POST" use:enhance action="?/register">
				<Form.Field {form} name="username">
					<Form.Control let:attrs>
						<Form.Label>Username</Form.Label>
						<Input {...attrs} bind:value={$formData.username} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
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
				<Form.Field {form} name="confirmPassword">
					<Form.Control let:attrs>
						<Form.Label>Confirm Password</Form.Label>
						<Input {...attrs} bind:value={$formData.confirmPassword} type="password" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div class="my-5 flex flex-col">
					<span
						>Already has an Account? <a
							href="../login"
							class="group relative text-[#18272F] no-underline"
						>
							Login
							<span
								class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
							></span>
						</a></span
					>
					<Form.Button>Register</Form.Button>
				</div>
			</form>
		</div>
	</div>
</div>
