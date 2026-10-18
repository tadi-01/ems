'use client'

import { useState, type FormEvent } from 'react'
import { Grid, Column, Form, Stack, TextInput, PasswordInput, Checkbox, Button, Link, Modal } from '@carbon/react'
import { ArrowRight, Checkmark, CheckmarkFilled, Security } from '@carbon/icons-react'

export function SignupPage() {
  const [complete, setComplete] = useState(false)
  const [dialog, setDialog] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setComplete(true)
  }

  return (
    <main id="main-content" className="page-main signup-main">
      <Grid fullWidth className="signup-grid">
        <Column sm={4} md={8} lg={8} className="story-column">
          <section className="signup-story" aria-labelledby="story-title">
            <div className="story-intro">
              <div className="eyebrow"><span className="status-dot" /> LESS BUSYWORK. MORE POSSIBILITY.</div>
              <h1 id="story-title">Good work starts<br />with a little space.</h1>
              <p>Your ideas, projects, and people. Together in one<br className="desktop-break" /> thoughtful workspace, built for what comes next.</p>
            </div>
            <div className="workspace-art" aria-hidden="true">
              <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
              <div className="art-square square-back" /><div className="art-square square-middle" /><div className="art-square square-front"><span className="art-cross">+</span></div>
              <div className="art-caption"><span>SPACE TO THINK</span><span>ROOM TO GROW ↗</span></div>
            </div>
            <div className="story-bottom">
              <div className="benefit"><Checkmark size={16} /> A clearer view of every project</div>
              <div className="benefit"><Checkmark size={16} /> A shared space to move ideas forward</div>
              <div className="story-note">A little structure. A lot of possibility.</div>
            </div>
          </section>
        </Column>
        <Column sm={4} md={8} lg={8} className="form-column">
          <section className="signup-panel" aria-labelledby="signup-title">
            <div className="signin-prompt">Already have an account? <Link href="#sign-in" onClick={(event) => { event.preventDefault(); setDialog('Sign in') }}>Log in <ArrowRight size={16} /></Link></div>
            <div className="form-content">
              <div className="form-heading"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2 id="signup-title">Make yourself at home.</h2><p>Create your free account. Great things start small.</p></div>
              {complete ? <div className="preview-success"><CheckmarkFilled size={32} /><h3>You&apos;re ready to get started.</h3><p>This is a preview, so no account was created and none of your information was saved.</p><Button kind="tertiary" onClick={() => setComplete(false)}>Back to sign up</Button></div> : <Form aria-label="Create your Forma account" onSubmit={submit}>
                <Stack gap={6}>
                  <TextInput id="full-name" name="name" labelText="Full name" placeholder="Alex Morgan" autoComplete="name" required />
                  <TextInput id="email" name="email" type="email" labelText="Email address" placeholder="you@company.com" autoComplete="email" required />
                  <PasswordInput id="password" name="password" labelText="Password" placeholder="Create a password" autoComplete="new-password" helperText="Use at least 8 characters." minLength={8} required />
                  <Checkbox id="terms" required labelText={<span>I agree to the <Link href="#terms" onClick={(event) => { event.preventDefault(); setDialog('Terms of Service') }}>Terms of Service</Link> and <Link href="#privacy" onClick={(event) => { event.preventDefault(); setDialog('Privacy Policy') }}>Privacy Policy</Link>.</span>} />
                  <Button type="submit" renderIcon={ArrowRight} className="signup-button">Create your account</Button>
                </Stack>
              </Form>}
              <div className="free-note"><Checkmark size={16} /> Free to get started <span>·</span> No credit card needed</div>
              <div className="privacy-note"><Security size={20} /><p>Your space, your information.<br />Always private. Always yours.</p></div>
            </div>
            <footer className="signup-footer"><span>© {new Date().getFullYear()} Forma</span><Link href="#help" onClick={(event) => { event.preventDefault(); setDialog('Need a hand?') }}>Need a hand? <ArrowRight size={16} /></Link></footer>
          </section>
        </Column>
      </Grid>
      <Modal open={!!dialog} passiveModal modalHeading={dialog} onRequestClose={() => setDialog('')}>
        <p>{dialog === 'Privacy Policy' ? 'This preview does not save or send your form information. There is no database or authentication service connected.' : 'You’re exploring a design preview. Account access, support, and legal pages are not connected in this demo.'}</p>
      </Modal>
    </main>
  )
}
