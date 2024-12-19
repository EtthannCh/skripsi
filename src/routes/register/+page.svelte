<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { registerSchema } from './register-schema';

	let { data } = $props();
	const form = superForm(data.form.data, {
		validators: zodClient(registerSchema),
		onResult: (event) => {
			if (event.result.type == 'failure') {
				toast('Register Successfully', event.result.data);
			} else {
				toast('Invalid Credentials / Email Has already been used');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<h1 class="my-5">Register</h1>
	<form method="POST" use:enhance action="/register">
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
		<Form.Button
			onclick={() => {
				form.reset();
			}}>Login</Form.Button
		>
	</form>
</div>
