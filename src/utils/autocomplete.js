import { LALIGA_PLAYERS_DB } from './players-db';

/**
 * Helper to display player names as "First Name + First Last Name".
 * Keeps prepositions and compound names (e.g. Alfredo Di Stéfano, José Vicente Train).
 */
export function formatDisplayName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;

  const secondPart = parts[1].toLowerCase();

  // Prepositions/conjunctions
  const prepositions = ["de", "del", "di", "da", "la", "y", "van", "von"];
  if (prepositions.includes(secondPart)) {
    return parts.slice(0, 3).join(' ');
  }

  // Common second parts of compound Spanish first names
  const compoundSecondParts = [
    "luis", "carlos", "vicente", "maria", "maría", "jose", "josé", "manuel", 
    "antonio", "francisco", "andres", "andrés", "miguel", "angel", "ángel", 
    "ramon", "ramón", "ignacio", "javier", "alberto", "david", "fernando"
  ];
  if (compoundSecondParts.includes(secondPart)) {
    return parts.slice(0, 3).join(' ');
  }

  // Otherwise, default to first name + first last name (first two words)
  return parts.slice(0, 2).join(' ');
}

/**
 * Attaches a brutalist autocomplete dropdown to an input element.
 * @param {HTMLInputElement} inputEl The input field element
 * @param {Function} onSelect Callback when a suggestion is selected: (player) => {}
 * @returns {Function} Cleanup function to unbind all events
 */
export function setupAutocomplete(inputEl, onSelect, customDatabase = null) {
  let dropdown = null;
  let activeIndex = -1;
  let suggestions = [];

  // Accent and special character normalizer
  function removeAccents(str) {
    if (!str) return '';
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ø/g, "o")
      .replace(/Ø/g, "O")
      .toLowerCase();
  }

  function closeDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
    activeIndex = -1;
  }

  function handleInput() {
    const val = inputEl.value.trim();
    const valNoAcc = removeAccents(val);

    // Minimum 3 characters to search (as requested by user)
    if (valNoAcc.length < 3) {
      closeDropdown();
      return;
    }

    const dbToSearch = customDatabase || LALIGA_PLAYERS_DB;

    // Filter players based on name, team, or search keys
    suggestions = dbToSearch.filter(p => {
      const nameNoAcc = removeAccents(p.name);
      const teamNoAcc = removeAccents(p.team || '');
      const matchesName = nameNoAcc.includes(valNoAcc);
      const matchesTeam = teamNoAcc.includes(valNoAcc);
      const matchesKeys = p.searchKeys ? p.searchKeys.some(key => removeAccents(key).includes(valNoAcc)) : false;
      return matchesName || matchesTeam || matchesKeys;
    }).slice(0, 40); // Limit to 40 suggestions to allow scrolling through results

    if (suggestions.length === 0) {
      closeDropdown();
      return;
    }

    renderDropdown();
  }

  function renderDropdown() {
    // Ensure parent has relative positioning for correct absolute dropdown placement
    if (inputEl.parentNode) {
      inputEl.parentNode.style.position = 'relative';
    }

    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'autocomplete-dropdown';
      inputEl.parentNode.appendChild(dropdown);
    }

    dropdown.innerHTML = suggestions.map((s, idx) => `
      <div class="autocomplete-item ${idx === activeIndex ? 'active' : ''}" data-index="${idx}" style="cursor: pointer; padding: 0.6rem 0.85rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border-color);">
        <span class="autocomplete-name" style="font-weight: 700; color: var(--text-light);">${formatDisplayName(s.name)}</span>
        <span class="autocomplete-team" style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">${s.team}</span>
      </div>
    `).join('');

    // Scroll active item into view
    if (activeIndex >= 0) {
      const activeEl = dropdown.querySelector(`.autocomplete-item[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }

    // Attach click events to items
    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        // Prevent input blur before select
        e.preventDefault();
      });
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10);
        selectItem(idx);
      });
    });
  }

  function selectItem(idx) {
    if (idx >= 0 && idx < suggestions.length) {
      const selected = suggestions[idx];
      inputEl.value = formatDisplayName(selected.name);
      onSelect(selected);
      closeDropdown();
    }
  }

  function handleKeyDown(e) {
    if (!dropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % suggestions.length;
      renderDropdown();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
      renderDropdown();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        selectItem(activeIndex);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    }
  }

  // Handle focus behavior
  function handleFocus() {
    if (inputEl.value.trim().length >= 3) {
      handleInput();
    }
  }

  // Handle blur behavior
  function handleBlur() {
    // Delay to let click event on item pass
    setTimeout(closeDropdown, 150);
  }

  inputEl.addEventListener('input', handleInput);
  inputEl.addEventListener('keydown', handleKeyDown);
  inputEl.addEventListener('focus', handleFocus);
  inputEl.addEventListener('blur', handleBlur);

  // Close when clicking outside
  const clickOutsideHandler = (e) => {
    if (dropdown && !inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  };
  document.addEventListener('click', clickOutsideHandler);

  // Return unbind/cleanup function
  return () => {
    inputEl.removeEventListener('input', handleInput);
    inputEl.removeEventListener('keydown', handleKeyDown);
    inputEl.removeEventListener('focus', handleFocus);
    inputEl.removeEventListener('blur', handleBlur);
    document.removeEventListener('click', clickOutsideHandler);
    closeDropdown();
  };
}
