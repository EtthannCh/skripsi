<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageData } from './$types';
	import { userRequestSchema, type UserCookiesSchema } from './user-schema';
	import { Field } from 'formsnap';
	let { data }: { data: PageData } = $props();
	const user: UserCookiesSchema = data.user;
	const form = superForm(data.form, {
		validators: zodClient(userRequestSchema)
	});
	const formSelection = data.formSelection.map((v) => {
		return {
			label: v.code,
			value: v.id.toString()
		};
	});

	let value = $state('');
	const triggerContent = $derived(
		formSelection.find((f) => f.value === value)?.label ?? 'Pilih form'
	);
	const { form: formData, enhance } = form;
	$formData.userId = user.userId;
</script>

<Accordion.Root
	type="single"
	class="mx-auto my-auto flex w-[700px] flex-col justify-center sm:max-w-[30%] md:max-w-[50%] lg:max-w-[100%]"
>
	<Accordion.Item value="item-1">
		<Accordion.Trigger>Pengambilan Form</Accordion.Trigger>
		<Accordion.Content>
			{#each data.data as form}
				<Card.Root class="my-5 flex w-full items-center justify-between">
					<Card.Header class="px-5 py-0">
						<Card.Title>{form.name}</Card.Title>
						<Card.Description>{form.description ?? 'Tidak Ada Penjelasan'}</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<div class="flex flex-col items-center justify-center gap-0.5 text-right">
							<Label>{form.code}</Label>
							<span
								><a href="#" class="group relative text-[#18272F] no-underline">
									Download PDF
									<span
										class="absolute bottom-0 left-0 h-[2px] w-full origin-right scale-x-0 rounded-sm bg-[#18272F] transition-transform group-hover:origin-left group-hover:scale-x-100"
									></span>
								</a></span
							>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="item-2">
		<Accordion.Trigger>Pengajuan Form</Accordion.Trigger>
		<Accordion.Content>
			<form action="?/submit" enctype="multipart/form-data" method="post" use:enhance>
				<Form.Field {form} name="userId">
					<Form.Control let:attrs>
						<Input bind:value={$formData.userId} type="hidden" />
					</Form.Control>
				</Form.Field>
				<div class="flex flex-col gap-5">
					<div>
						<Label>User Name</Label>
						<Input value={user.username} disabled />
					</div>
					<div>
						<Label>User Email</Label>
						<Input value={user.email} disabled />
					</div>
				</div>
				<Form.Field {form} name="formId">
					<Form.Control let:attrs>
						<div class="my-5 flex w-full flex-col gap-5">
							<Form.Label>Jenis Form</Form.Label>
							<Select.Root type="single" name="favoriteFruit" bind:value={$formData.formId}>
								<Select.Trigger>
									{formSelection.find((v) => v.value == $formData.formId)?.label ?? 'Pilih Form'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										{#each formSelection as form}
											<Select.Item value={form.value} label={form.label}>{form.label}</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</div>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="formFile">
					<Form.Control>
						<Form.Label>Upload Form Permohonan</Form.Label>
						<Input accept="application/pdf" type="file" bind:value={$formData.formFile} />
					</Form.Control>
				</Form.Field>
				<Form.Button class="bg-black text-white my-5">Submit</Form.Button>
			</form>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
