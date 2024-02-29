import StructuredEventData, {
  type StructedEventDataConfig,
  type StructedEventDataProps,
} from 'sentry/components/structuredEventData';

const config: StructedEventDataConfig = {
  isString: value => typeof value === 'string',
  renderObjectKeys: value => `"${value}"`,
};

export function JsonEventData(props: Omit<StructedEventDataProps, 'config'>) {
  return <StructuredEventData {...props} config={config} />;
}
