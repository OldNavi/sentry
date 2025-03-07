import {useMemo, useRef} from 'react';
import type {Theme} from '@emotion/react';
import styled from '@emotion/styled';

import {Button} from 'sentry/components/button';
import type {MenuItemProps} from 'sentry/components/dropdownMenu';
import {DropdownMenu} from 'sentry/components/dropdownMenu';
import {DropdownMenuFooter} from 'sentry/components/dropdownMenu/footer';
import useFeedbackWidget from 'sentry/components/feedback/widget/useFeedbackWidget';
import Placeholder from 'sentry/components/placeholder';
import Tag from 'sentry/components/tag';
import {IconChevron} from 'sentry/icons';
import {t, tct} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import {
  type Activity,
  type AvatarUser,
  GroupActivityType,
  PriorityLevel,
} from 'sentry/types';
import {defined} from 'sentry/utils';
import {useApiQuery} from 'sentry/utils/queryClient';

type GroupPriorityDropdownProps = {
  groupId: string;
  onChange: (value: PriorityLevel) => void;
  value: PriorityLevel;
  lastEditedBy?: 'system' | AvatarUser;
};

type GroupPriorityBadgeProps = {
  priority: PriorityLevel;
  children?: React.ReactNode;
};

const PRIORITY_KEY_TO_LABEL: Record<PriorityLevel, string> = {
  [PriorityLevel.HIGH]: t('High'),
  [PriorityLevel.MEDIUM]: t('Med'),
  [PriorityLevel.LOW]: t('Low'),
};

const PRIORITY_OPTIONS = [PriorityLevel.HIGH, PriorityLevel.MEDIUM, PriorityLevel.LOW];

function getTagTypeForPriority(priority: string): keyof Theme['tag'] {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'error';
    case PriorityLevel.MEDIUM:
      return 'warning';
    case PriorityLevel.LOW:
    default:
      return 'default';
  }
}

function useLastEditedBy({
  groupId,
  lastEditedBy: incomingLastEditedBy,
}: Pick<GroupPriorityDropdownProps, 'groupId' | 'lastEditedBy'>) {
  const {data} = useApiQuery<{activity: Activity[]}>([`/issues/${groupId}/activities/`], {
    enabled: !defined(incomingLastEditedBy),
    staleTime: 0,
  });

  const lastEditedBy = useMemo(() => {
    if (incomingLastEditedBy) {
      return incomingLastEditedBy;
    }

    if (!data) {
      return null;
    }

    return (
      data?.activity?.find(activity => activity.type === GroupActivityType.SET_PRIORITY)
        ?.user ?? 'system'
    );
  }, [data, incomingLastEditedBy]);

  return lastEditedBy;
}

export function GroupPriorityBadge({priority, children}: GroupPriorityBadgeProps) {
  return (
    <StyledTag type={getTagTypeForPriority(priority)}>
      {PRIORITY_KEY_TO_LABEL[priority] ?? t('Unknown')}
      {children}
    </StyledTag>
  );
}

function PriorityChangeActor({
  groupId,
  lastEditedBy,
}: Pick<GroupPriorityDropdownProps, 'groupId' | 'lastEditedBy'>) {
  const resolvedLastEditedBy = useLastEditedBy({groupId, lastEditedBy});

  if (!resolvedLastEditedBy) {
    return <InlinePlaceholder height="1em" width="60px" />;
  }

  if (resolvedLastEditedBy === 'system') {
    return <span>Sentry</span>;
  }

  return <span>{resolvedLastEditedBy.name}</span>;
}

function GroupPriorityFeedback() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const feedback = useFeedbackWidget({
    buttonRef,
    messagePlaceholder: t('How can we make priority better for you?'),
  });

  if (!feedback) {
    return null;
  }

  return (
    <StyledButton
      ref={buttonRef}
      size="zero"
      borderless
      onClick={e => e.stopPropagation()}
    >
      {t('Give Feedback')}
    </StyledButton>
  );
}

export function GroupPriorityDropdown({
  groupId,
  value,
  onChange,
  lastEditedBy,
}: GroupPriorityDropdownProps) {
  const options: MenuItemProps[] = useMemo(() => {
    return PRIORITY_OPTIONS.map(priority => ({
      textValue: PRIORITY_KEY_TO_LABEL[priority],
      key: priority,
      label: <GroupPriorityBadge priority={priority} />,
      onAction: () => onChange(priority),
    }));
  }, [onChange]);

  return (
    <DropdownMenu
      size="sm"
      menuTitle={
        <MenuTitleContainer>
          <div>{t('Set Priority')}</div>
          <GroupPriorityFeedback />
        </MenuTitleContainer>
      }
      minMenuWidth={210}
      trigger={triggerProps => (
        <DropdownButton
          {...triggerProps}
          aria-label={t('Modify issue priority')}
          size="zero"
        >
          <GroupPriorityBadge priority={value}>
            <IconChevron direction="down" size="xs" />
          </GroupPriorityBadge>
        </DropdownButton>
      )}
      items={options}
      menuFooter={
        <DropdownMenuFooter>
          <div>
            {tct('Last edited by [name]', {
              name: <PriorityChangeActor groupId={groupId} lastEditedBy={lastEditedBy} />,
            })}
          </div>
        </DropdownMenuFooter>
      }
      shouldCloseOnInteractOutside={target =>
        // Since this can open a feedback modal, we want to ignore interactions with it
        !document.getElementById('sentry-feedback')?.contains(target)
      }
      position="bottom-end"
    />
  );
}

const DropdownButton = styled(Button)`
  font-weight: normal;
  border: none;
  padding: 0;
  height: unset;
  border-radius: 10px;
  box-shadow: none;
`;

const StyledTag = styled(Tag)`
  span {
    display: flex;
    align-items: center;
    gap: ${space(0.5)};
  }
`;

const InlinePlaceholder = styled(Placeholder)`
  display: inline-block;
  vertical-align: middle;
`;

const MenuTitleContainer = styled('div')`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const StyledButton = styled(Button)`
  font-size: ${p => p.theme.fontSizeSmall};
  color: ${p => p.theme.subText};
  font-weight: normal;
  padding: 0;
  border: none;

  &:hover {
    color: ${p => p.theme.subText};
  }
`;
