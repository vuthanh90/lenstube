import { LENS_CUSTOM_FILTERS } from '@lenstube/constants'
import type { Publication } from '@lenstube/lens'
import {
  PublicationMainFocus,
  PublicationTypes,
  useExploreQuery
} from '@lenstube/lens'
import { useScrollToTop } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import React, { useCallback, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native'

import useMobileStore from '~/store'

import AudioCard from '../common/AudioCard'
import VideoCard from '../common/VideoCard'
import Filters from './Filters'
import Showcase from './Showcase'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    flex: 1
  }
})

const Timeline = () => {
  const scrollRef = useRef<FlashList<Publication>>(null)
  // @ts-expect-error FlashList as type is not supported
  useScrollToTop(scrollRef)

  const { height } = useWindowDimensions()

  const selectedExploreFilter = useMobileStore(
    (state) => state.selectedExploreFilter
  )

  const request = {
    sortCriteria: selectedExploreFilter.criteria,
    limit: 10,
    noRandomize: false,
    publicationTypes: [PublicationTypes.Post],
    customFilters: LENS_CUSTOM_FILTERS,
    metadata: {
      tags:
        selectedExploreFilter.category &&
        selectedExploreFilter.category !== 'all'
          ? { oneOf: [selectedExploreFilter.category] }
          : undefined,
      mainContentFocus: [PublicationMainFocus.Audio, PublicationMainFocus.Video]
    }
  }

  const { data, fetchMore, loading } = useExploreQuery({
    variables: { request }
  })

  const publications = data?.explorePublications?.items as Publication[]
  const pageInfo = data?.explorePublications?.pageInfo

  const fetchMorePublications = async () => {
    await fetchMore({
      variables: {
        request: {
          ...request,
          cursor: pageInfo?.next
        }
      }
    })
  }

  const renderItem = useCallback(
    ({ item }: { item: Publication }) =>
      item.metadata.mainContentFocus === PublicationMainFocus.Audio ? (
        <AudioCard audio={item} />
      ) : (
        <VideoCard video={item} />
      ),
    []
  )

  const HeaderComponent = useMemo(
    () => (
      <>
        <Showcase />
        <Filters />
      </>
    ),
    []
  )

  return (
    <View style={[styles.container, { height }]}>
      <FlashList
        ref={scrollRef}
        ListHeaderComponent={HeaderComponent}
        data={publications}
        estimatedItemSize={publications?.length ?? 50}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item.id}_${i}`}
        ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
        ListFooterComponent={() =>
          loading && <ActivityIndicator style={{ paddingVertical: 20 }} />
        }
        onEndReached={fetchMorePublications}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default Timeline
