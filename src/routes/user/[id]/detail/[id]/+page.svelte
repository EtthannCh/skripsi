<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label';
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { navigating } from '$app/state';
	import { Stretch } from 'svelte-loading-spinners';
	let { data }: { data: PageData } = $props();
</script>

<button
	class="mx-10 my-5 flex rounded-md bg-uphButton p-3 text-white"
	onclick={() => {
		window.history.back();
	}}
>
	<ArrowLeft />
	<span>Back</span>
</button>
{#if navigating.to}
	<div class="mx-10 mb-4 h-10">
		<Stretch color="#314986" />
	</div>
{/if}
<!-- {#if data.user?.roleId == 3} -->
<div class="mx-10 my-10 rounded-md border-2 bg-uph p-5 md:h-[600px] lg:h-[300px]">
	<div class="flex gap-10 sm:flex-col md:flex-col lg:flex-row lg:items-center">
		<div class="w-[500px] md:h-[200px] md:w-[500px] lg:h-[250px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Applicant's Detail</Card.Title>
					<Card.Description>Applicants who Submitted this Request</Card.Description>
				</Card.Header>
				<Separator />
				<Card.Content>
					<div class="flex max-h-[130px] flex-col gap-5 overflow-y-scroll">
						<Label class="text-lg">NIM : {data.userData?.email.split('@')[0]}</Label>
						<Label class="text-lg">
							<div class="flex justify-between mr-5">
								<span>Name : {data.userData?.username}</span>
								<span>(Informatics)</span>
							</div>
						</Label>
						<Label class="text-lg">Student Email : {data.userData?.email}</Label>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<div>
			<img
				src={uphLogo}
				alt="logo_uph"
				class="rounded-full sm:hidden md:hidden lg:block lg:w-[200px]"
			/>
		</div>
		<div class="md:h-[200px] md:w-[500px] lg:h-[250px] lg:w-[500px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Process</Card.Title>
					<Card.Description
						>From Submitting Application until Receiving Requested Document</Card.Description
					>
				</Card.Header>
				<Separator />
				<Card.Content>
					<div class="scrollbar-hidden flex max-h-[130px] flex-col gap-5 overflow-y-scroll">
						<Label class="text-lg">Date of Submission :</Label>
						<Label class="text-lg">Date of Process (By Admin) :</Label>
						<Label class="text-lg">Date of Process (By Admin) :</Label>
						<Label class="text-lg">Date of Process (By Admin) :</Label>

						<Label class="text-lg">Date of Process (By Admin) :</Label>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
<!-- {/if} -->
