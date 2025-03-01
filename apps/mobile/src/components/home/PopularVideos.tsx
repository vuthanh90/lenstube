import { LENS_CUSTOM_FILTERS, LENSTUBE_BYTES_APP_ID } from '@lenstube/constants'
import { getThumbnailUrl, imageCdn, trimify } from '@lenstube/generic'
import type { Publication } from '@lenstube/lens'
import {
  PublicationMainFocus,
  PublicationSortCriteria,
  PublicationTypes,
  useExploreQuery
} from '@lenstube/lens'
import { useNavigation } from '@react-navigation/native'
import { Image as ExpoImage, ImageBackground } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Skeleton } from 'moti/skeleton'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import normalizeFont from '~/helpers/normalize-font'
import { theme } from '~/helpers/theme'
import useMobileStore from '~/store'

import UserProfile from '../common/UserProfile'
import HCarousel from '../ui/HCarousel'

const CAROUSEL_HEIGHT = 210
const BORDER_RADIUS = 25

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  thumbnail: {
    width: '100%',
    height: CAROUSEL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    borderColor: theme.colors.grey,
    borderWidth: 1
  },
  gradient: {
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    marginTop: 1,
    right: 1,
    left: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    opacity: 0.8,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    zIndex: 2
  },
  otherInfo: {
    fontFamily: 'font-medium',
    fontSize: normalizeFont(10),
    color: theme.colors.white
  },
  title: {
    fontFamily: 'font-bold',
    color: theme.colors.white,
    fontSize: normalizeFont(10),
    width: '60%'
  }
})

const PopularVideos = () => {
  const { navigate } = useNavigation()

  const selectedChannel = useMobileStore((state) => state.selectedChannel)
  const homeGradientColor = useMobileStore((state) => state.homeGradientColor)

  const request = {
    publicationTypes: [PublicationTypes.Post],
    limit: 5,
    sortCriteria: PublicationSortCriteria.TopCollected,
    customFilters: LENS_CUSTOM_FILTERS,
    metadata: {
      mainContentFocus: [PublicationMainFocus.Audio, PublicationMainFocus.Video]
    }
  }

  const { data, loading, error } = useExploreQuery({
    variables: {
      request,
      channelId: selectedChannel?.id ?? null
    }
  })
  const publications = data?.explorePublications?.items as Publication[]

  if (error) {
    return null
  }

  return (
    <View style={styles.container}>
      <Skeleton
        show={loading}
        colors={[`${homeGradientColor}10`, '#00000080']}
        radius={BORDER_RADIUS}
        height={CAROUSEL_HEIGHT}
      >
        <View>
          <HCarousel
            height={CAROUSEL_HEIGHT}
            borderRadius={BORDER_RADIUS}
            data={publications}
            renderItem={({ item }: { item: Publication }) => {
              const isBytes = item.appId === LENSTUBE_BYTES_APP_ID
              const thumbnailUrl = imageCdn(
                getThumbnailUrl(item, true),
                isBytes ? 'THUMBNAIL_V' : 'THUMBNAIL'
              )
              return (
                <Pressable
                  onPress={() => navigate('WatchVideo', { id: item.id })}
                >
                  <ImageBackground
                    source={{
                      uri: thumbnailUrl
                    }}
                    blurRadius={15}
                    style={{ position: 'relative' }}
                    imageStyle={{ opacity: 0.8, borderRadius: BORDER_RADIUS }}
                  >
                    <LinearGradient
                      colors={['#00000090', '#00000080', 'transparent']}
                      style={styles.gradient}
                    >
                      <Text numberOfLines={1} style={styles.title}>
                        {trimify(item.metadata.name ?? '')}
                      </Text>
                      <UserProfile
                        profile={item.profile}
                        size={15}
                        radius={3}
                      />
                    </LinearGradient>
                    <ExpoImage
                      source={{
                        uri: thumbnailUrl
                      }}
                      transition={300}
                      contentFit={isBytes ? 'contain' : 'cover'}
                      style={styles.thumbnail}
                    />
                  </ImageBackground>
                </Pressable>
              )
            }}
          />
        </View>
      </Skeleton>
    </View>
  )
}

export default PopularVideos
