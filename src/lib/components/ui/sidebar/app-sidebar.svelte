<script lang="ts">
	import uphLogo from '$lib/assets/images/uph_logo.jpg';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ChevronUp, Users } from 'lucide-svelte';
	import House from 'lucide-svelte/icons/house';
	import * as DropdownMenu from '../dropdown-menu';

	import { goto } from '$app/navigation';
	import type {
		MajorDbSchema,
		UserCookiesSchema
	} from '../../../../routes/(app)/home/request-user-schema';

	let { user, majorData }: { user: UserCookiesSchema; majorData: MajorDbSchema } = $props();
	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Role',
			url: '/role',
			icon: Users
		}
	];

	const logout = async () => {
		const res = await fetch('/logout', { method: 'POST' });
		if (res.ok) goto('/', { invalidateAll: true });
	};
</script>

<Sidebar.Root class="h-full bg-uph text-white">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="my-5 flex gap-3 text-xl"
				><img src={uphLogo} alt="logo uph" class="h-10 w-10 rounded-full" /> UPH MEDAN</Sidebar.GroupLabel
			>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items.slice(0, 1) as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
					{#if user.roleCode == 'HUPHM'}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={items[items.length - 1].url} {...props}>
										<Users />
										<span>{items[items.length - 1].title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-[50px]"
							>
								<span class="flex flex-col gap-1 max-h-[50px] overflow-y-scroll">
									<span>
										{`${user.username.toUpperCase()} ( ${majorData.code.toUpperCase()} )`}
									</span>
									<span class="text-sm">
										{user.email}
									</span>
								</span>

								<ChevronUp class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
						{#if user.roleCode == 'STD'}
							<a href={`/user/request/${user.id}`}>
								<DropdownMenu.Item>
									<span>My Request</span>
								</DropdownMenu.Item>
							</a>
						{/if}
						<DropdownMenu.Item onclick={logout}>
							<span>Log Out</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
