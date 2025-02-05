<script lang="ts">
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
	class="flex flex-col justify-center items-center gap-10 h-full rounded-md bg-gradient-to-br from-cyan-500 to-blue-800 text-white"
>
	<Label class="text-lg font-bold">Gunakan Kode yang diberikan untuk Registrasi</Label>
	<span class="text-md">Kode yang diberikan tidak valid dalam waktu 5 MENIT</span>
	<form class="flex flex-col items-center gap-5" action="?/verify" method="post">
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
			class={`rounded-md bg-black px-5 py-3 ${timer > 0 ? 'bg-gray-500 text-gray-300' : ''}`}
			type="submit"
			onclick={startTimer}>Verify {timer > 0 ? timer + ' Detik' : ''}</button
		>
		<button
			class={`rounded-md bg-black px-5 py-3 ${timer > 0 ? 'bg-gray-500 text-gray-300' : ''}`}
			disabled={timer > 0}
			onclick={startTimer}>Kirim Kode Ulang {timer > 0 ? timer + ' Detik' : ''}</button
		>
	</form>
	<span class="text-md">Kode dikirimkan ke alamat e-mail : {data.userCookies.email}</span>
</div>
