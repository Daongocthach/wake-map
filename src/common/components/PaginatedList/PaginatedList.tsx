import { FlashList } from '@shopify/flash-list';
import {
  forwardRef,
  isValidElement,
  type ComponentType,
  type ForwardedRef,
  type ReactElement,
} from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EmptyState } from '@/common/components/EmptyState';
import { Loading } from '@/common/components/Loading';
import { AppRefreshControl } from '@/common/components/RefreshControl';
import { useBottomPadding } from '@/hooks';
import type { PaginatedListProps, PaginatedListRef } from './PaginatedList.types';

export const PaginatedList = forwardRef(
  <T,>(
    {
      data,
      keyExtractor,
      renderItem,
      loading = false,
      refreshing = false,
      onRefresh,
      hasNextPage = false,
      isLoadingMore = false,
      onLoadMore,
      emptyState,
      contentContainerStyle,
      tabBarAware = false,
      onScroll,
      scrollEventThrottle,
      ListHeaderComponent,
      ItemSeparatorComponent,
      ListFooterComponent,
      stickyHeaderIndices,
      onEndReachedThreshold = 0.5,
      drawDistance = 1000,
      refreshControlProps,
    }: PaginatedListProps<T>,
    ref: ForwardedRef<PaginatedListRef<T>>
  ) => {
    const bottomPadding = useBottomPadding(tabBarAware);

    if (loading) {
      return <Loading fullScreen />;
    }

    const footer =
      isLoadingMore || ListFooterComponent ? (
        <View style={styles.footer}>
          {renderListComponent(ListFooterComponent)}
          {isLoadingMore && <Loading size="small" />}
        </View>
      ) : null;

    const emptyComponent =
      data.length === 0 && emptyState ? <EmptyState {...emptyState} /> : undefined;

    return (
      <FlashList
        ref={ref}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        drawDistance={drawDistance}
        refreshControl={
          onRefresh ? (
            <AppRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              {...refreshControlProps}
            />
          ) : undefined
        }
        contentContainerStyle={[contentContainerStyle, { paddingBottom: bottomPadding }]}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onEndReached={() => {
          if (hasNextPage && !isLoadingMore) {
            onLoadMore?.();
          }
        }}
        onEndReachedThreshold={onEndReachedThreshold}
        ListHeaderComponent={ListHeaderComponent}
        stickyHeaderIndices={stickyHeaderIndices}
        ItemSeparatorComponent={ItemSeparatorComponent ?? DefaultItemSeparator}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={footer}
      />
    );
  }
) as <T>(
  props: PaginatedListProps<T> & { ref?: ForwardedRef<PaginatedListRef<T>> }
) => ReactElement;

function renderListComponent<T>(component: PaginatedListProps<T>['ListFooterComponent']) {
  if (!component) {
    return null;
  }

  if (isValidElement(component)) {
    return component;
  }

  const Component = component as ComponentType;
  return <Component />;
}

function DefaultItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create((theme) => ({
  footer: {
    paddingVertical: theme.metrics.spacingV.p16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.metrics.spacingV.p8,
  },
  separator: {
    height: theme.metrics.spacingV.p12,
  },
}));
