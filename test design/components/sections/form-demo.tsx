'use client'

import {
  Button,
  Checkbox,
  Column,
  DatePicker,
  DatePickerInput,
  Form,
  Grid,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
  Tile,
} from '@carbon/react'
import { ArrowRight } from '@carbon/icons-react'

export function FormDemo() {
  return (
    <section id="forms" className="section">
      <Grid>
        <Column sm={4} md={8} lg={5}>
          <h2 className="section__title">Forms</h2>
          <p className="section__subtitle">
            Carbon form inputs share fluid and fixed variants, built-in label
            and helper text slots, and validation states. Compose them with
            Stack for consistent vertical rhythm.
          </p>
        </Column>
        <Column sm={4} md={8} lg={11}>
          <Tile>
            <Form
              aria-label="Project request form"
              onSubmit={(e) => e.preventDefault()}
            >
              <Stack gap={6}>
                <Grid fullWidth narrow>
                  <Column sm={4} md={4} lg={8}>
                    <TextInput
                      id="project-name"
                      labelText="Project name"
                      placeholder="e.g. carbon-dashboard"
                      helperText="Lowercase letters, numbers, and hyphens"
                    />
                  </Column>
                  <Column sm={4} md={4} lg={8}>
                    <Select
                      id="region"
                      labelText="Region"
                      helperText="Where the project will be hosted"
                      defaultValue="us-east"
                    >
                      <SelectItem
                        value="us-east"
                        text="US East (Washington DC)"
                      />
                      <SelectItem value="us-south" text="US South (Dallas)" />
                      <SelectItem value="eu-de" text="EU (Frankfurt)" />
                      <SelectItem value="jp-tok" text="Asia Pacific (Tokyo)" />
                    </Select>
                  </Column>
                </Grid>
                <Grid fullWidth narrow>
                  <Column sm={4} md={4} lg={8}>
                    <DatePicker datePickerType="single">
                      <DatePickerInput
                        id="start-date"
                        labelText="Start date"
                        placeholder="mm/dd/yyyy"
                      />
                    </DatePicker>
                  </Column>
                  <Column sm={4} md={4} lg={8}>
                    <RadioButtonGroup
                      legendText="Visibility"
                      name="visibility"
                      defaultSelected="private"
                    >
                      <RadioButton
                        labelText="Private"
                        value="private"
                        id="vis-private"
                      />
                      <RadioButton
                        labelText="Internal"
                        value="internal"
                        id="vis-internal"
                      />
                      <RadioButton
                        labelText="Public"
                        value="public"
                        id="vis-public"
                      />
                    </RadioButtonGroup>
                  </Column>
                </Grid>
                <TextArea
                  id="description"
                  labelText="Description"
                  placeholder="What is this project for?"
                  rows={3}
                />
                <Checkbox
                  id="notify"
                  labelText="Notify me about deployment status changes"
                  defaultChecked
                />
                <div>
                  <Button type="submit" renderIcon={ArrowRight}>
                    Create project
                  </Button>
                  <Button kind="ghost">Cancel</Button>
                </div>
              </Stack>
            </Form>
          </Tile>
        </Column>
      </Grid>
    </section>
  )
}
