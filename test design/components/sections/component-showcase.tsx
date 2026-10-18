'use client'

import { useState } from 'react'
import {
  Grid,
  Column,
  Tile,
  Form,
  Stack,
  TextInput,
  Select,
  SelectItem,
  Checkbox,
  Button,
  Toggle,
  Tag,
  InlineNotification,
  ProgressIndicator,
  ProgressStep,
  ContentSwitcher,
  Switch,
  Slider,
  Search,
} from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

export function ComponentShowcase() {
  const [notifications, setNotifications] = useState(true)

  return (
    <section id="components" className="section">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <h2 className="section__title">Components</h2>
          <p className="section__subtitle">
            Accessible, production-ready React components from @carbon/react,
            composed into realistic product surfaces.
          </p>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile className="showcase-tile">
            <h3 className="foundation-tile__title">Create a workspace</h3>
            <Form aria-label="Create a workspace">
              <Stack gap={6}>
                <TextInput
                  id="workspace-name"
                  labelText="Workspace name"
                  placeholder="e.g. cloud-platform-prod"
                  helperText="Lowercase letters, numbers, and hyphens only"
                />
                <Select
                  id="workspace-region"
                  labelText="Region"
                  defaultValue="us-east"
                >
                  <SelectItem value="us-east" text="US East (Washington DC)" />
                  <SelectItem value="us-south" text="US South (Dallas)" />
                  <SelectItem value="eu-de" text="EU (Frankfurt)" />
                  <SelectItem value="jp-tok" text="Asia Pacific (Tokyo)" />
                </Select>
                <Checkbox
                  id="workspace-terms"
                  labelText="I agree to the terms of service"
                />
                <div>
                  <Button renderIcon={ArrowRight}>Create workspace</Button>
                  <Button kind="secondary">Cancel</Button>
                </div>
              </Stack>
            </Form>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile className="showcase-tile">
            <h3 className="foundation-tile__title">Controls and feedback</h3>
            <Stack gap={6}>
              <Search
                labelText="Search"
                placeholder="Search resources"
                id="showcase-search"
              />
              <ContentSwitcher onChange={() => {}} selectedIndex={0}>
                <Switch name="all" text="All resources" />
                <Switch name="running" text="Running" />
                <Switch name="stopped" text="Stopped" />
              </ContentSwitcher>
              <Slider
                id="showcase-slider"
                labelText="vCPU allocation"
                min={1}
                max={64}
                value={16}
                step={1}
              />
              <Toggle
                id="showcase-toggle"
                labelText="Email notifications"
                labelA="Off"
                labelB="On"
                toggled={notifications}
                onToggle={setNotifications}
              />
              <div className="tag-row">
                <Tag type="green">Active</Tag>
                <Tag type="magenta">Beta</Tag>
                <Tag type="purple">Machine learning</Tag>
                <Tag type="teal">Kubernetes</Tag>
              </div>
              <InlineNotification
                kind="success"
                title="Deployment complete."
                subtitle="All 4 services are healthy."
                lowContrast
                hideCloseButton
              />
            </Stack>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={16}>
          <Tile className="showcase-tile">
            <h3 className="foundation-tile__title">Provisioning progress</h3>
            <ProgressIndicator currentIndex={2} spaceEqually>
              <ProgressStep
                label="Configure"
                secondaryLabel="Workspace settings"
              />
              <ProgressStep label="Network" secondaryLabel="VPC and subnets" />
              <ProgressStep label="Provision" secondaryLabel="In progress" />
              <ProgressStep label="Verify" secondaryLabel="Health checks" />
            </ProgressIndicator>
          </Tile>
        </Column>
      </Grid>
    </section>
  )
}
