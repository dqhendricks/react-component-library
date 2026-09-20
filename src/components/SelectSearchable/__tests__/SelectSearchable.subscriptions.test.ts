import { describe, expect, it, vi } from 'vitest';
import { createSelectSearchableStore } from '../SelectSearchableStoreContext';

function setup() {
  const store = createSelectSearchableStore();
  const options = ['Alice', 'Alex', 'Bob'].map(label => ({ id: label, value: label, label }));
  store.setValue(undefined);
  store.registerCollection({ options });
  const listeners = options.map(option => {
    const listener = vi.fn();
    store.subscribeOption(option.id, listener);
    return listener;
  });
  return { store, options, listeners };
}

describe('SelectSearchable option subscriptions', () => {
  it('notifies only the old and new active rows in a 30,000-option collection', () => {
    const store = createSelectSearchableStore();
    store.setValue(undefined);
    const options = Array.from({ length: 30_000 }, (_, i) => ({ id: `${i}`, value: `${i}`, label: `Person ${i}` }));
    store.registerCollection({ options });
    const notified: string[] = [];
    for (const option of options) store.subscribeOption(option.id, () => notified.push(option.id));
    store.setActiveDescendantId('100');
    expect(notified).toEqual(['100']);
    notified.length = 0;
    store.moveActive(1);
    expect(notified).toEqual(['100', '101']);
    notified.length = 0;
    store.setActiveDescendantId('101');
    store.setOpen(true);
    store.setA11y({ ariaLabel: 'People' });
    expect(notified).toEqual([]);
  });

  it('notifies only changed visibility and selection flags', () => {
    const { store, listeners: [alice, alex, bob] } = setup();
    store.setFlags({ multiple: true, disabled: false });
    store.setValue(['Alice']);
    expect(alice).toHaveBeenCalledTimes(1);
    expect(alex).not.toHaveBeenCalled();
    expect(bob).not.toHaveBeenCalled();
    store.setValue(['Alice', 'Alex']);
    expect(alice).toHaveBeenCalledTimes(1);
    expect(alex).toHaveBeenCalledTimes(1);
    store.setSearchQuery('AL');
    expect(bob).toHaveBeenCalledTimes(1);
    store.setSearchQuery(' al ');
    expect(bob).toHaveBeenCalledTimes(1);
    store.setSearchQuery('');
    expect(bob).toHaveBeenCalledTimes(2);
    store.setFlags({ multiple: false, disabled: false });
    expect(alice).toHaveBeenCalledTimes(2);
    expect(alex).toHaveBeenCalledTimes(2);
  });

  it('handles collection updates, clearing, and unsubscribe/resubscribe', () => {
    const { store, options, listeners: [alice, alex, bob] } = setup();
    store.registerCollection({ options: options.map(option => ({ ...option })) });
    expect(alice).not.toHaveBeenCalled();
    expect(alex).not.toHaveBeenCalled();
    expect(bob).not.toHaveBeenCalled();
    store.registerCollection({ options: options.map(option => ({ ...option, disabled: option.id === 'Bob' })) });
    expect(bob).toHaveBeenCalledTimes(1);
    store.clearCollection();
    expect(alice).toHaveBeenCalledTimes(1);
    expect(alex).toHaveBeenCalledTimes(1);
    expect(bob).toHaveBeenCalledTimes(1);

    const listener = vi.fn();
    const unsubscribe = store.subscribeOption('new', listener);
    unsubscribe();
    store.setActiveDescendantId('new');
    expect(listener).not.toHaveBeenCalled();
    const unsubscribeAgain = store.subscribeOption('new', listener);
    store.setActiveDescendantId(null);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribeAgain();
  });
});
