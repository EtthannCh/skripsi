<script lang="ts">
	import { enhance } from '$app/forms';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import Label from '$lib/components/ui/label/label.svelte';
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';
	const { data } = $props();
	let interval: any;
	let timer = $state(0);

	const startTimer = () => {
		clearInterval(interval);
		timer = 30;
		if (!interval && timer > 0) {
			interval = setInterval(() => {
				if (timer > 0) {
					timer--;
				} else {
					clearInterval(interval);
				}
			}, 1000);
		}
	};
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center gap-10 rounded-md bg-gradient-to-br from-cyan-500 to-blue-800 text-white"
>
	<Label class="text-lg font-bold">Gunakan Kode yang diberikan untuk Registrasi</Label>
	<span class="text-md">Kode yang diberikan tidak valid dalam waktu 5 MENIT</span>
	<form
		class="flex flex-col items-center gap-5"
		action="?/verify"
		method="post"
		use:enhance={() => {
			startTimer();
		}}
	>
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
		<button
			name="action"
			value="verify"
			class={`rounded-md bg-black px-5 py-3 ${timer > 0 ? 'bg-gray-500 text-gray-300' : ''}`}
			disabled={timer > 0}
			type="submit">Verify {timer > 0 ? timer + ' Detik' : ''}</button
		>
		<button
			name="action"
			value="reverify"
			class={`rounded-md bg-black px-5 py-3 ${timer > 0 ? 'bg-gray-500 text-gray-300' : ''}`}
			disabled={timer > 0}
			type="submit">Resend Code {timer > 0 ? timer + ' Detik' : ''}</button
		>
	</form>
	<span class="text-md">Code has been sent to this email address : {data.userCookies.email}</span>
</div>
