import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';

function getLabelEl() {
  return screen.getByText('Select Person');
}

function getTrigger() {
  return screen.getByRole('button', { name: /^Select Person(?: |$)/ });
}

function getSearch() {
  // Without a local name, Search falls back to the field label.
  return screen.getByRole('combobox', { name: /^Select Person(?: |$)/ });
}

function getErrorEl() {
  return screen.getByText('Error');
}

describe('SelectSearchable (aria)', () => {
  it('wires the label to trigger and search via aria-labelledby', async () => {
    const user = userEvent.setup();
    renderBasic();

    const label = getLabelEl();
    const trigger = getTrigger();

    // Trigger labelled by the Label element id
    const labelId = label.getAttribute('id');
    expect(labelId, 'Label should have an id').toBeTruthy();

    expect(trigger).toHaveAttribute('aria-labelledby');
    expect(trigger.getAttribute('aria-labelledby')!.split(/\s+/)).toContain(labelId!);

    // Open so the combobox is present/accessible
    await user.click(trigger);

    const search = getSearch();
    expect(search).toHaveAttribute('aria-labelledby');
    expect(search.getAttribute('aria-labelledby')!.split(/\s+/)).toContain(labelId!);
  });

  it('does not render the error when aria-invalid is not true (hideWhenValid)', () => {
    renderBasic();

    expect(
      screen.queryByText('Error'),
      'Error should not be rendered when aria-invalid is not true',
    ).not.toBeInTheDocument();
  });

  it('when aria-invalid is true, error becomes visible and is referenced by describedby', async () => {
    const user = userEvent.setup();

    renderBasic({ 'aria-invalid': true });

    const trigger = getTrigger();
    const error = getErrorEl();

    // Visible now
    expect(error, 'Error should be visible when aria-invalid is true').toBeVisible();

    // Error should have an id so it can be referenced
    const errorId = error.getAttribute('id');
    expect(errorId, 'Error element should have an id').toBeTruthy();

    expect(trigger).toHaveAttribute('aria-describedby', errorId);
    expect(trigger).not.toHaveAttribute('aria-errormessage');

    await user.click(trigger);

    const search = getSearch();
    expect(search).toHaveAttribute('aria-describedby', errorId);
    expect(search).not.toHaveAttribute('aria-errormessage');
  });
});