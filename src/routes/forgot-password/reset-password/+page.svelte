<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	let loading = $state(false);
	let { data }: { data: PageData } = $props();
	const form = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-right',
					dismissable: true
				});
				goto('/').then(() => goto('/login', { invalidateAll: true }));
			} else if (result.type == 'failure') {
				toast.error(result.data?.message, {
					position: 'top-center',
					dismissable: true
				});
				goto('/').then(() => goto('/forgot-password', { invalidateAll: true }));
			}
			loading = false;
		},
		onSubmit: () => {
			loading = true;
		}
	});

	const { form: formData, enhance } = form;
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center gap-5 space-y-1.5 bg-uph text-white"
>
	{#if loading}
		<span class="h-10">
			Loading <SyncLoader color="#007bff" />
		</span>
	{:else}
		<h1>Enter your Password</h1>
		<form
			action="?/resetpass"
			method="post"
			use:enhance
			class="flex flex-col gap-5 rounded-md bg-white p-5 text-black"
		>
			<Form.Field {form} name="password">
				<Form.Control let:attrs>
					<Label for="email">Enter Your Password</Label>
					<Separator></Separator>
					<Input
						{...attrs}
						placeholder="Enter your Password"
						type="password"
						class="w-[250px]"
						bind:value={$formData.password}
					/>
					<Form.FieldErrors></Form.FieldErrors>
				</Form.Control>
			</Form.Field>
			<button class="items-start rounded-md bg-uphButton p-3 text-white">Submit</button>
		</form>
	{/if}
</div>
