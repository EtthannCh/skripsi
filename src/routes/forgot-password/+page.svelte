<script lang="ts">
	import { message } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const form = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success('Success', {
					position: 'top-right',
					dismissable: true
				});
				goto('/home');
			} else if(result.type == "failure"){
				toast.error("Invalid Email", {
					position: 'top-center',
					dismissable: true
				});
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center gap-5 space-y-1.5 bg-uph text-white"
>
	<h1>Enter your Email to receive OTP Code For Reset Password</h1>
	<form
		action="?/forgot"
		method="post"
		use:enhance
		class="flex flex-col gap-5 rounded-md bg-white p-5 text-black"
	>
		<Form.Field {form} name="email">
			<Form.Control let:attrs>
				<Label for="email">Enter Your email</Label>
				<Separator></Separator>
				<Input
					{...attrs}
					placeholder="Enter your Email"
					type="email"
					class="w-[250px]"
					bind:value={$formData.email}
				/>
				<Form.FieldErrors/>
			</Form.Control>
		</Form.Field>
		<button
			class="items-start rounded-md bg-uphButton p-3 text-white"
			disabled={$formData.email.length < 8}>Submit</button
		>
	</form>
</div>
