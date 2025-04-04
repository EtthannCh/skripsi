<script lang="ts">
	import { navigating } from '$app/state';
	import * as Form from '$lib/components/ui/form';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';
	import { SyncLoader } from 'svelte-loading-spinners';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

	const { data } = $props();
	let loading = $state(false);

	const form = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type == 'success') {
				toast.success(result.data?.form.message, {
					position: 'top-right',
					dismissable: true
				});
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

	const { form: formData, enhance } = form;
	let process: string = $state('');
	let otp: string = $state('');

	const startTimer = () => {
		$formData.process = process;
		if (process == 'reverify') {
			otp = '';
		}
	};
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center gap-10 rounded-md bg-gradient-to-br from-cyan-500 to-blue-800 text-white"
>
	{#if loading || navigating.to}
		<span class="h-10">
			Loading <SyncLoader color="#000000" />
		</span>
	{:else}
		<Label class="text-lg font-bold">Gunakan Kode yang diberikan untuk Registrasi</Label>
		<span class="text-md">Kode yang diberikan tidak valid dalam waktu 5 MENIT</span>
		<form class="flex flex-col items-center gap-5" action="?/verify" method="post" use:enhance>
			<input type="hidden" bind:value={$formData.process} name="process" />
			<input type="hidden" bind:value={$formData.otp} name="otp" />
			<Form.Field {form} name="otp">
				<InputOTP.Root
					maxlength={6}
					pattern={REGEXP_ONLY_DIGITS}
					class="flex justify-center"
					name="otp"
				>
					{#snippet children({ cells })}
						<InputOTP.Group>
							{#each cells.slice(0, 2) as cell}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group>
							{#each cells.slice(2, 4) as cell}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group>
							{#each cells.slice(4, 6) as cell}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
					{/snippet}
				</InputOTP.Root>
			</Form.Field>
			<button
				class={`rounded-md bg-black px-5 py-3`}
				onclick={() => {
					process = 'verify';
					startTimer();
				}}
				type="submit"
				>Verify
			</button>
			<button
				class={`rounded-md bg-black px-5 py-3`}
				onclick={() => {
					process = 'reverify';
					startTimer();
				}}
				>Resend Code
			</button>
		</form>
	{/if}
	<span class="text-md">Code has been sent to this email address : {data.userCookies.email}</span>
</div>
