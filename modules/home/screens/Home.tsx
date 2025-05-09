import { MeParqueoApi, Place } from '@/api'
import { ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import {
  Chip,
  ScreenWrapper,
  useAppDispatch,
  useAppSelector,
} from '@/modules/common'
import { onChangeQuery, searchPlace } from '@/store'
import { isAxiosError } from 'axios'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  ParkingDetailsSheet,
  RecentParkingsList,
  ReportModal,
  SearchBar,
} from '../components'
import { useHome } from '../hooks'

export const HomeScreen = () => {
  const {
    bottomSheetRef,
    callParkingLot,
    currentParking,
    handleParkingCardPress,
    hideReportModal,
    isReportModalOpen,
    openMapDirection,
    showReportModal,
  } = useHome()

  const { loading, query, places } = useAppSelector((state) => state.search)
  const dispatch = useAppDispatch()
  const [isFocused, setIsFocused] = useState(false)

  const handlePlacePress = async (place: Place) => {
    saveDestination(place)
    setIsFocused(false)
    router.push({
      pathname: '/home/search',
      params: {
        place: JSON.stringify(place),
      },
    })
  }

  const saveDestination = async (destination: Place) => {
    try {
      await MeParqueoApi.post('/api/v1/user/search', {
        filter: {
          availability: [],
          services: [],
          paymentMethods: [],
        },
        destinationLocation: {
          latitude: destination.location.latitude,
          longitude: destination.location.longitude,
          searchTerm: query,
        },
      })

      console.log('destination saved')
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response)
        return
      }

      console.log(error)
    }
  }

  const handleQueryChange = (query: string) => {
    dispatch(onChangeQuery(query))
  }

  const handleClearQuery = () => {
    dispatch(onChangeQuery(''))
  }

  const handleSearch = (placeName: string) => {
    dispatch(searchPlace(placeName))
  }

  useEffect(() => {
    if (places.length === 0) {
      return
    }
    const firstPlace = places[0]
    handlePlacePress(firstPlace)
  }, [places])

  const router = useRouter()

  return (
    <GestureHandlerRootView>
      <ScreenWrapper className="bg-white">
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <VStack className="w-full">
          <VStack className="w-full">
            <SearchBar
              query={query}
              onQueryChange={handleQueryChange}
              placeholder="A donde quieres ir?"
              className="mt-3 bg-white rounded-lg"
              onSearch={handleSearch}
              loading={loading}
              places={places}
              onPlacePress={handlePlacePress}
              onClear={handleClearQuery}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
            />
          </VStack>
          <HStack space="md" className="w-full items-start mt-4">
            <Chip
              selected={false}
              onPress={() => router.push('/home/allparkinglots')}
            >
              <ButtonText style={{ fontFamily: 'Neuwelt-Light' }}>
                Ver todos los parqueaderos
              </ButtonText>
            </Chip>
          </HStack>

          <RecentParkingsList onCardPress={handleParkingCardPress} />
        </VStack>

        {currentParking && (
          <ParkingDetailsSheet
            ref={bottomSheetRef}
            parkingLot={currentParking}
            onCallParkingLot={callParkingLot}
            onOpenMapDirection={openMapDirection}
            onShowReportModal={showReportModal}
          />
        )}

        {currentParking && (
          <ReportModal
            parkingLot={currentParking}
            opened={isReportModalOpen}
            onCancel={hideReportModal}
            onConfirm={hideReportModal}
          />
        )}
      </ScreenWrapper>
    </GestureHandlerRootView>
  )
}
