import {IconGroup} from 'sentry/icons';
import {t} from 'sentry/locale';
import {Row} from 'sentry/views/performance/traceDetails/styles';

import type {ParentAutogroupNode} from '../../traceTree';

import {TraceDrawerComponents} from './styles';

export function ParentAutogroupNodeDetails({node}: {node: ParentAutogroupNode}) {
  return (
    <TraceDrawerComponents.DetailContainer>
      <TraceDrawerComponents.IconTitleWrapper>
        <TraceDrawerComponents.IconBorder>
          <IconGroup color="blue300" size="md" />
        </TraceDrawerComponents.IconBorder>
        <div style={{fontWeight: 'bold'}}>{t('Autogroup')}</div>
      </TraceDrawerComponents.IconTitleWrapper>

      <TraceDrawerComponents.Table className="table key-value">
        <tbody>
          <Row title={t('Grouping Logic')}>
            {t(
              'Chain of immediate and only children spans with the same operation as their parent.'
            )}
          </Row>
          <Row title={t('Group Count')}>{node.groupCount}</Row>
          <Row title={t('Grouping Key')}>
            {t('Span Operation')} : {node.value.op}
          </Row>
        </tbody>
      </TraceDrawerComponents.Table>
    </TraceDrawerComponents.DetailContainer>
  );
}
