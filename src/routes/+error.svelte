<script>
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-5">
	<h1 class="text-3xl">{page.error?.message}</h1>
	<button class="bg-uphButton p-3 rounded-md text-white">
		<a href="/home"> Home </a>
	</button>
</div>
